/*
Title: Common functions and variables Module
Authors: 
    Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
    Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
    Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: 
Copyright: Capsicum Corporation 2015, 2016, 2017

*/

$.sap.declare("IomyRe.common",true);

$.sap.require("sap.m.MessageBox");

IomyRe.common = new sap.ui.base.Object();

$.extend(IomyRe.common,{
    
    //============================================//
    //== Initialisation Variable                ==//
    //============================================//
    //-- Variables that are used to declare if    --//
    //-- a login has been successful or not        --//
    //--------------------------------------------//
    CoreVariablesInitialised: false,
    CoreVariableRefreshIntervalInstance : null,
    
    
    //============================================//
    //== Core Refresh Variables                 ==//
    //============================================//
    oCurrentLoginTimestamp:         0,                  //-- OBJECT:    A javascript date object to hold the last login timestamp so API requests know easily when they have been orphaned. --//
    bUserCurrentlyLoggedIn:         false,              //-- BOOLEAN:   Used to indicate if a user is currently logged in. If a user isn't logged in then abort all API requests. --//
    bCoreRefreshInProgress:         false,              //-- BOOLEAN:   Used to indicate if a core variable refresh is currently in progress. --//
    bCoreVariablesRestart:          false,              //-- BOOLEAN:   Used to indicate that the Core Variables Refresh should restart when it complete the current refresh. --//
    aCoreVariablesResConfig:        [],                 //-- ARRAY:     --//
    aCoreVariablesResNextConfig:    [],                 //-- ARRAY:     --//
    iCoreVariablesLastRefresh:      0,                  //-- INTEGER:   --//
    iCoreVariablesRefreshInterval:  600000,             //-- INTEGER:   Time in milliseconds of when a Core Variable refresh needs to take place. --//
    oCoreVariableTimeout:           null,               //-- OBJECT:    --//
    
    
    //============================================//
    // Mutexes
    //============================================//
    mxToasts : new Mutex({ manual : true }),
    
    
    //============================================//
    //== USER VARIABLES                            ==//
    //============================================//
    //-- Arrays used to store the User's variables
    //--------------------------------------------//
    CurrentUsername         : null,
    UserId                    : 0, //-- Use UserInfo.UserId --//
    UserDisplayName            : null,
    
    UserVars : {},            //-- TODO: Check if this variable is still used anywhere --//
    
    UserInfo:               {},
    UserList:               {},
    UserInfoLastUpdate:     new Date(),
    
    UserAppVariables: {
        "PagePerms": {
            "SettingsThingList":    false,        //-- BOOLEAN:    Flags if the User is allowed to access the "SettingsThingList" Page.        --//
            "SettingsPremiseList":  false        //-- BOOLEAN:    Flags if the User is allowed to access the "SettingsPremiseList" Page.        --//
        }
    },
    
    //============================================//
    //== OPTIONAL VARIABLE                      ==//
    //============================================//
    bRegionsLoaded                  : false,
    bLanguagesLoaded                : false,
    bTimezonesLoaded                : false,
    bRoomTypesLoaded                : false,
    bPremiseRoomsOptionsLoaded      : false,
    bPremiseOccupantsOptionsLoaded  : false,
    bPremiseFloorsOptionsLoaded     : false,
    bPremiseBedroomsOptionsLoaded   : false,
    bLinkTypesLoaded                : false,
    
    Regions                 : {},
    Languages               : {},
    Timezones               : {},
    RoomTypes               : {},
    PremiseOccupantsOptions : {},
    PremiseRoomsOptions     : {},
    PremiseFloorsOptions    : {},
    PremiseBedroomsOptions  : {},
    LinkTypeList            : {},
    
    //============================================//
    //== PREMISE AND HUB LIST                   ==//
    //============================================//
    PremiseList:                    {},
    HubList:                        {},
    PremiseListLastUpdate:            new Date(),
    HubListLastUpdate:                new Date(),
    PremiseSelected:                [],
    
    //============================================//
    //== ROOM LISTS                             ==//
    //============================================//
    AllRoomsList:                     {},
    RoomsList:                        {},
    RoomsListLastUpdate:              new Date(),
    RoomAdminRoomsList:               {},
    RoomAdminRoomsListLastUpdate:     new Date(),
    
    //============================================//
    //== DEVICE LIST                            ==//
    //============================================//
    //-- An Array used to store the Thing List  --//
    //--------------------------------------------//
    CommList                        : {},
    CommListLastUpdate              : new Date(),
    LinkList                        : {},
    LinkListLastUpdate:               new Date(),
    ThingList                        : {},
    ThingListLastUpdate:            new Date(),

    //============================================//
    //== OTHER USERS AND PERMISSIONS            ==//
    //============================================//
    PermLevelsPremise:              {
        "_0": {
            "Id":   0,
            "Name": "No Access"
        },
        "_1": {
            "Id":   1,
            "Name": "Read Only"
        },
        "_2": {
            "Id":   2,
            "Name": "Read and Write"
        },
        "_3": {
            "Id":   3,
            "Name": "Premise Management"
        },
        "_4": {
            "Id":   4,
            "Name": "Premise Administrator (Hidden Premise)"
        },
        "_5": {
            "Id":   5,
            //"Name": "Premise Administrator (Visible Premise)"
            "Name": "Premise Administrator"
        }
    },
    PermLevelsRoom:              {
        "_0": {
            "Id":   0,
            "Name": "No Access"
        },
        "_1": {
            "Id":   1,
            "Name": "Read Only"
        },
        "_2": {
            "Id":   2,
            "Name": "Read & Device Toggle"
        },
        "_3": {
            "Id":   3,
            "Name": "Full Access"
        }
    },
    
    
    
    //============================================//
    //== Navigational Variables                    ==//
    //============================================//
    NavPagesNavigationArray         : [],            //-- ARRAY:            This array holds the list of Pages (and Parameters).    --//
    NavPagesCurrentIndex            : -1,            //-- INTEGER:        This is the index of what page the User is on. NOTE: 0 indicates that the user is on the "Navigation Main" Page (or "Login" Page)    --//
    mHelpData                       : {},            //-- Map:         This is where the help information will be stored before the user can login --//
    
    //============================================//
    //== Boolean flags                          ==//
    //============================================//
    bItemNameChangedMustRefresh     : false,        //-- BOOLEAN:       Indicates whether to refresh certain pages after changing the name of an item   --//
    bSessionTerminated              : false,        //-- BOOLEAN:       Indicates whether the session was terminated for whatever reason. Sets to true when an API request (OData or PHP) encounters a HTTP 403 error.   --//
    
    
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
    //== Initialisation Variable                ==//
    //============================================//
    //-- Variables that are used to declare if    --//
    //-- a login has been successful or not        --//
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
                //== Initialise variables                       ==//
                //================================================//
                
                //================================================//
                //== 2.A - User is currently logged in          ==//
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
                var sErrMesg    = "";
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
    
    Logout : function () {
        $.ajax({
            url : IomyRe.apiphp.APILocation('sessioncheck'), 
            type : "POST",
            dataType : "json",
            data : {
                "username":	"",
                "password":	"",
                "AttemptLogin":	"1"
            },
            success : function( oResponseData, sHTTPCode, jqXHR ) {
                IomyRe.common.WipeCoreVariables();
                IomyRe.common.NavigationChangePage( "pLogin" , {});
            }
        });
    },
    
    //================================================//
    //== ERROR MESSAGE POPUP                        ==//
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
        
        try {
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
        } catch (e1) {
            $.sap.log.error("Error with displaying the MessageBox:"+e1.message);
        }
    },
    
    /**
     * Displays an information popup with a message. It can call a function once
     * the toast disappears
     * 
     * @param {type} mSettings          Map containing parameters.
     */
    showMessage : function( mSettings ){
        var me                    = this;
        var bError                = false;
        var aErrorMessages        = [];
        var aWarningMessages    = [];
        var bAutoClose            = true;
        var sMessage;
        var iMilliseconds;
        var oCurrentView;
        
        var fnAppendError = function (sMessage) {
            bError = true;
            aErrorMessages.push(sMessage);
        };
        
        //--------------------------------------------------------------------//
        // Check that the required parameters are set.
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //----------------------------------------------------------------//
            // Find the context of the view or controller
            //----------------------------------------------------------------//
            if (mSettings.view !== undefined) {
                oCurrentView = mSettings.view;
                
                if (!(oCurrentView instanceof sap.ui.core.mvc.JSView) && !(oCurrentView instanceof sap.ui.core.mvc.Controller) ) {
                    fnAppendError("Invalid view! Ensure that the object is a UI5 View or Controller.");
                }
            } else {
                oCurrentView = oApp.getCurrentPage();
            }
            
            //----------------------------------------------------------------//
            // See if the text property was given.
            //----------------------------------------------------------------//
            if (mSettings.text !== undefined) {
                sMessage = mSettings.text;
            } else {
                fnAppendError("'text' was not specified.");
            }
            
            //----------------------------------------------------------------//
            // See if the duration property was given.
            //----------------------------------------------------------------//
            if (mSettings.duration !== undefined) {
                iMilliseconds = mSettings.duration;
            } else {
                iMilliseconds = 4000;
            }
            
            //----------------------------------------------------------------//
            // See if the show property was given.
            //----------------------------------------------------------------//
            if (mSettings.autoClose !== undefined) {
                //------------------------------------------------------------//
                // Check that the value given was a boolean value. If it is not,
                // log a warning message and default to true.
                //------------------------------------------------------------//
                if (typeof mSettings.autoClose === "boolean") {
                    bAutoClose = mSettings.autoClose;
                    
                } else {
                    aWarningMessages.push("'autoClose' parameter given was of type '"+typeof mSettings.autoClose+"'. Expected a boolean. 'autoClose' will be true.");
                }
            }
            
            if (bError) {
                throw new IllegalArgumentException(aErrorMessages.join('\n'));
            }
            
        } else {
            fnAppendError("'text' was not specified.");
            throw new MissingSettingsMapException(aErrorMessages.join('\n'));
        }
        
        oCurrentView.expectingMessage = true;

        me.mxToasts.synchronize({
            task : function () {
                if (oApp.getCurrentPage().expectingMessage === true) {
                    // open a fully configured message toast
                    sap.m.MessageToast.show(
                        sMessage,
                        {
                            autoClose : bAutoClose || true,
                            duration : iMilliseconds,
                            onClose : function () {
                                me.mxToasts.dequeue();
                                
                                if (!me.mxToasts.busy) {
                                    oCurrentView.expectingMessage = false;
                                }
                            }
                        }
                    );
                }
            }
        });
        
        if (!me.mxToasts.busy) {
            me.mxToasts.dequeue();
        }

    },
    
    showInformation : function( sMessage, sTitle, fnCallback, sCssClass ){
        //-- --//
        var callbackFn = fnCallback || function(){};
        var cssClass   = sCssClass || "";
        
        // open a fully configured message box
        sap.m.MessageBox.show(
            sMessage,
            {
                icon: sap.m.MessageBox.Icon.INFORMATION,
                title: sTitle,
                actions: sap.m.MessageBox.Action.CLOSE,
                onClose: fnCallback,
                styleClass: cssClass
            }
        );
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
    
    // Confirm Question for Sign Out
    showConfirmQuestion : function( sMessage, sTitle, fnCallback, sCssClass ){
        //-- Defaults --//
        var callbackFn = fnCallback || function(){};
        var cssClass = sCssClass || "";
        
        // open a fully configured message box
        sap.m.MessageBox.confirm(
            sMessage,
            {
                title: sTitle,
                onClose: callbackFn,
                styleClass : cssClass
            }
        );
    },
    
    //================================================//
    //== Show and hide Loading.                        ==//
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
                text                    : sMsg,
                customIcon                : "resources/images/Preloader_2.gif",
                customIconDensityAware    : false,
                customIconHeight        : "150px",
                customIconWidth            : "150px",
                customIconRotationSpeed    : 0
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
    
    showContactSupportMessage : function () {
        return "Please contact iOmy support to report this error.";
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
            IomyRe.common.NavPagesNavigationArray = [];
            IomyRe.common.NavPagesCurrentIndex = -1;
            //-- Load the 1ST Page --//
            IomyRe.common.NavigationChangePage( IomyRe.common.sNavigationDefaultPage, {}, true );
            
            //-- Load the optional variables --//
            IomyRe.common.RefreshOptionalVariables({});
            
            //-- Setup the AutoRefreshCoreVariables Check --//
            IomyRe.common.RefreshCoreVariableQueueCheck();
        }
    },
    
    //================================================================//
    //== Refresh Variables                                          ==//
    //================================================================//
    RefreshCoreVariables: function( aConfig, oScope ) {
        //-- TODO: Possibly make the "onFail" error messages call a function that decides the best course of action. --//
        //--     eg.  
        //--     OnFirstRun    - Throw a popup error message with a "ok/retry" button that reloads the page.
        //--     OnAutoRefresh - Let the user know somehow that they have lost connection to the server and have an option that .
        var oScope = this;  //-- SCOPE:     Binds the scope to a variable so that this particular scope can be accessed by sub-functions --//
        
        
        try {
            
            //------------------------------------------------------------------//
            //-- IF The Core variables aren't already in currently refreshing --//
            //------------------------------------------------------------------//
            if( IomyRe.common.bCoreRefreshInProgress===false ) {
                
                //-- Flag that the CoreVariables are refreshing --//
                IomyRe.common.bCoreRefreshInProgress = true;
                
                //-- Remove the Restart flag --//
                IomyRe.common.bCoreVariablesRestart = false;
                
                
                //----------------------------------------//
                //-- PART 1: REFRESH USERINFO LIST      --//
                //----------------------------------------//
                IomyRe.common.RefreshUserInfoList({
                    onSuccess: $.proxy( function() {
                        
                        //----------------------------------------//
                        //-- PART 2: REFRESH PREMISE LIST       --//
                        //----------------------------------------//
                        IomyRe.common.RefreshPremiseList({
                            onSuccess: $.proxy( function() {
                                
                                //----------------------------------------//
                                //-- PART 3: REFRESH HUB LIST           --//
                                //----------------------------------------//
                                IomyRe.common.RefreshHubList({
                                    onSuccess: $.proxy( function() {
                                        
                                        //----------------------------------------//
                                        //-- PART 4: REFRESH COMM LIST          --//
                                        //----------------------------------------//
                                        IomyRe.common.RefreshCommList({
                                            onSuccess: $.proxy( function() {
                                                
                                                //----------------------------------------//
                                                //-- PART 5: REFRESH ROOM LIST          --//
                                                //----------------------------------------//
                                                IomyRe.common.RetreiveRoomList({
                                                    onSuccess: $.proxy( function() {
                                                        
                                                        //----------------------------------------//
                                                        //-- PART 6: REFRESH LINK LIST          --//
                                                        //----------------------------------------//
                                                        IomyRe.common.RetrieveLinkList({
                                                            onSuccess: $.proxy( function() {
                                                                
                                                                //----------------------------------------//
                                                                //-- PART 7: REFRESH IO LIST            --//
                                                                //----------------------------------------//
                                                                IomyRe.common.RefreshThingList({
                                                                    onSuccess: $.proxy( function() {
                                                                        
                                                                        //-------------------------------------------------------//
                                                                        //-- Flag that the Core Variables have been configured --//
                                                                        //-------------------------------------------------------//
                                                                        IomyRe.common.CoreVariablesInitialised = true;
                                                                        
                                                                        
                                                                        //-------------------------------------------------------//
                                                                        //-- Perform the onSuccess event                       --//
                                                                        //-------------------------------------------------------//
                                                                        try {
                                                                            //-- Update when the last core variables occurred --//
                                                                            var oTemp = new Date();
                                                                            IomyRe.common.iCoreVariablesLastRefresh = oTemp.getTime();
                                                                            
                                                                            //------------------------------------------------------------//
                                                                            //-- Trigger the normal "onSuccess" event                   --//
                                                                            if( aConfig.onSuccess ) {
                                                                                try {
                                                                                    aConfig.onSuccess();
                                                                                } catch( e00a ) {
                                                                                    jQuery.sap.log.error("Critical Error: Problem when triggering the onSuccess event for the RefreshCoreVariables function.\n"+e00a.message);
                                                                                }
                                                                            }
                                                                            
                                                                            //------------------------------------------------------------//
                                                                            //-- Run all the on Success events in the current config    --//
                                                                            if( IomyRe.common.aCoreVariablesResConfig.length >= 1 ) {
                                                                                $.each( IomyRe.common.aCoreVariablesResConfig, function ( iIndex, aTempConfig ) {
                                                                                    //-- Trigger any onSuccess events --//
                                                                                    if( aTempConfig.onSuccess ) {
                                                                                        try {
                                                                                            aTempConfig.onSuccess();
                                                                                        } catch( e00b ) {
                                                                                            jQuery.sap.log.error("Critical Error: Problem when triggering the one of multiple onSuccess events for the RefreshCoreVariables function.\n"+e00b.message);
                                                                                        }
                                                                                    }
                                                                                });
                                                                                
                                                                                //-- Reset the array so this can't be accidentally triggered --//
                                                                                IomyRe.common.aCoreVariablesResConfig = [];
                                                                            }
                                                                            
                                                                            //------------------------------------------------------------//
                                                                            //-- If the Core Variables needs to restart on completion   --// 
                                                                            if( IomyRe.common.bCoreVariablesRestart===false ) {
                                                                                //-- Turn off the "RefreshInProgress" state as the refresh has finished --//
                                                                                IomyRe.common.bCoreRefreshInProgress = false;
                                                                                
                                                                            } else {
                                                                                //-- Replace the Current Config with the next --//
                                                                                IomyRe.common.aCoreVariablesResConfig = IomyRe.common.aCoreVariablesResNextConfig;
                                                                                
                                                                                //-- Start the next refresh Core Variables --//
                                                                                IomyRe.common.bCoreRefreshInProgress = false;
                                                                                IomyRe.common.RefreshCoreVariables({});
                                                                            }
                                                                            
                                                                        } catch( e00 ) {
                                                                            jQuery.sap.log.error("Critical Error: Problem when doing the final processing in the RefreshCoreVariables function.\n"+e00.message);
                                                                        }
                                                                        
                                                                    }, oScope),
                                                                    onFail: $.proxy( function() {
                                                                        IomyRe.common.bCoreRefreshInProgress = false;
                                                                        jQuery.sap.log.error("Error: Failed to update the ThingList for the RefreshCoreVariables function.");
                                                                        
                                                                    }, oScope)
                                                                }); //-- END PART 7 ( IO LIST ) --//
                                                                
                                                            }, oScope),
                                                            onFail: $.proxy(function() {
                                                                IomyRe.common.bCoreRefreshInProgress = false;
                                                                jQuery.sap.log.error("Error: Failed to update the LinkList for the RefreshCoreVariables function.");
                                                                
                                                            }, oScope)
                                                        }); //-- END PART 6 ( LINK LIST ) --//
                                                        
                                                    }, oScope),
                                                    onFail: $.proxy(function() {
                                                        IomyRe.common.bCoreRefreshInProgress = false;
                                                        jQuery.sap.log.error("Error: Failed to update the RoomList for the RefreshCoreVariables function.");
                                                        
                                                    }, oScope)
                                                }); //-- END PART 5 ( ROOMS LIST ) --//
                                                
                                            }, oScope),
                                            onFail: $.proxy(function() {
                                                IomyRe.common.bCoreRefreshInProgress = false;
                                                jQuery.sap.log.error("Error: Failed to update the CommList for the RefreshCoreVariables function.");
                                                
                                            }, oScope)
                                        }); //-- END PART 4 ( COMM LIST ) --//
                                        
                                    }, oScope),
                                    onFail: $.proxy( function() {
                                        IomyRe.common.bCoreRefreshInProgress = false;
                                        jQuery.sap.log.error("Error: Failed to update the HubList for the RefreshCoreVariables function.");
                                        
                                    }, oScope)
                                }); //-- END PART 3 ( HUB LIST ) --//
                                
                            }, oScope),
                            onFail: $.proxy( function() {
                                IomyRe.common.bCoreRefreshInProgress = false;
                                jQuery.sap.log.error("Error: Failed to update the PremiseList for the RefreshCoreVariables function.");
                                
                            }, oScope)
                        }); //-- END PART 2 ( PREMISE LIST ) --//
                    }, oScope),
                    onFail: $.proxy( function() {
                        IomyRe.common.bCoreRefreshInProgress = false;
                        jQuery.sap.log.error("Error: Failed to update the UserInfoList for the RefreshCoreVariables function.");
                        
                    }, oScope)
                }); //-- END PART 1 ( USERINFO LIST ) --//
            } else {
                //-- Flag that the core variables will need to be refreshed again after is completes --//
                IomyRe.common.bCoreVariablesRestart = true;
                
                //-- Push the current config into the array of what to do next --//
                IomyRe.common.aCoreVariablesResNextConfig.push( aConfig );
                
            }
        } catch(e1) {
            jQuery.sap.log.error("RefreshCoreVariables Error! "+e1.message);
        }
    },
    
    /*
     * This function gets run in order to schedule a check to see if the
     * Core Variables need refreshing.
     */
    RefreshCoreVariableQueueCheck: function() {
        //----------------------------------------//
        //-- Clear existing timeout             --//
        //----------------------------------------//
        try {
            if( IomyRe.common.oCoreVariableTimeout ) {
                clearTimeout( IomyRe.common.oCoreVariableTimeout );
            }
        } catch( e0 ) {
            //-- Do nothing --//
        }
        
        //----------------------------------------//
        //-- Set new Timeout                    --//
        //----------------------------------------//
        try {
            IomyRe.common.oCoreVariableTimeout = setTimeout(
                function() {
                    IomyRe.common.RefreshCoreVariablesCheckEvent();
                },
                IomyRe.common.iCoreVariablesRefreshInterval
            );
        } catch( e1 ) {
            //-- Do nothing --//
        }
    },
    
    /*
     * This gets run by RefreshCoreVariableQueueCheck() to perform the check and
     * run the RefreshCoreVariables function if needed.
     */
    RefreshCoreVariablesCheckEvent: function() {
        //-- Declare variables --//
        var oScope         = this;
        var oDate          = new Date();
        var iCurrentTime   = oDate.getTime();
        var iLastRefresh   = IomyRe.common.iCoreVariablesLastRefresh;
        var iDurationLimit = IomyRe.common.iCoreVariablesRefreshInterval;
        //-- Check how long ago the last refresh occurred --//
        if( ( iCurrentTime - iLastRefresh ) >= iDurationLimit ) {
            //-- IF RefreshCoreVariables is not running --//
            if( IomyRe.common.bCoreRefreshInProgress===false ) {
                //-------------------------------------------------------------//
                //-- OUTCOME A: Refresh                                      --//
                //-------------------------------------------------------------//
                
                //-- Execute the RefreshCoreVariables --//
                IomyRe.common.RefreshCoreVariables(
                    {
                        onSuccess: $.proxy( function() {
                            //--------------------------------------------------------//
                            //-- Queue up the next refreshcore variables check so   --//
                            //-- that it can execute at the desired time            --//
                            //--------------------------------------------------------//
                            IomyRe.common.RefreshCoreVariableQueueCheck();
                        }, oScope)
                    },
                    oScope
                );
            } else {
                //-------------------------------------------------------------//
                //-- OUTCOME B: Reschedule due to it already being performed --//
                //-------------------------------------------------------------//
                
                //-- Queue up the next AutoCheck to happen --//
                IomyRe.common.RefreshCoreVariableQueueCheck();
            }
        } else {
            //-------------------------------------------------------------//
            //-- OUTCOME C: Reschedule due to already up to date         --//
            //-------------------------------------------------------------//
            
            //-- Queue up the next AutoCheck to happen --//
            IomyRe.common.RefreshCoreVariableQueueCheck();
        }
    },
    
    
    //================================================================//
    //== Refresh Optional Variables                                 ==//
    //================================================================//
    RefreshOptionalVariables: function( aConfig ) {
        //-- NOTES: These should only be polled if they are needed and not on every login attempt. --//
        //-- TODO: Fix this in a future version so they are only fetched from the APIs when a page that gets loaded depends upon that particular list --//
        var me                = this;            //-- SCOPE:        Binds the scope to a variable so that this particular scope can be accessed by sub-functions --//
        
        
        try {
            
            //------------------------------------------------//
            //-- PART 1A - Load the Regions                 --//
            //------------------------------------------------//
            IomyRe.common.LoadRegions({
                onSuccess: $.proxy( function () {
                    //------------------------------------------------//
                    //-- PART 1B - Load the Languages                --//
                    //------------------------------------------------//
                    IomyRe.common.LoadLanguages({
                        onSuccess: $.proxy( function() {
                            //------------------------------------------------//
                            //-- PART 1C - Load the Timezones                --//
                            //------------------------------------------------//
                            IomyRe.common.LoadTimezones({
                                onSuccess: $.proxy( function() {
                                    
                                    
                                }, me),
                                onFail: $.proxy( function() {
                                    jQuery.sap.log.error("Error: Failed to update the Timezones for the RefreshOptionalVariables function.");
                                    
                                }, me)
                            }); //-- END PART 1C ( Timezones ) --//
                            
                        }, me),
                        onFail: $.proxy( function() {
                            jQuery.sap.log.error("Error: Failed to update the Languages for the RefreshOptionalVariables function.");
                            
                        }, me)
                    }); //-- END PART 1B ( Languages ) --//
                    
                }, me),
                onFail: $.proxy( function() {
                    jQuery.sap.log.error("Error: Failed to update the Regions for the RefreshOptionalVariables function.");
                    
                }, me)
            }); //-- END PART 1A ( Regions ) --//
            
            //------------------------------------------------//
            //-- PART 2A - Load the Room Types               --//
            //------------------------------------------------//
            IomyRe.common.RetrieveLinkTypeList({
                onSuccess: $.proxy( function() {
                    //------------------------------------------------//
                    //-- PART 2B - Load the Premise Bedroom Options  --//
                    //------------------------------------------------//
                    IomyRe.common.LoadPremiseBedroomsOptions({
                        onSuccess: $.proxy( function() {
                            //------------------------------------------------//
                            //-- PART 2C - Load the Premise Occupant Options --//
                            //------------------------------------------------//
                            IomyRe.common.LoadPremiseOccupantsOptions({
                                onSuccess: $.proxy( function() {

                                }, me),
                                onFail: $.proxy( function() {
                                    jQuery.sap.log.error("Error: Failed to update the PremiseFloorOptions for the RefreshOptionalVariables function.");

                                }, me)
                            }); //-- END PART 2C ( Premise Occupant Options ) --//

                        }, me),
                        onFail: $.proxy( function() {
                            jQuery.sap.log.error("Error: Failed to update the PremiseBedroomOptions for the RefreshOptionalVariables function.");

                        }, me)
                    }); //-- END PART 2B ( Premise Bedroom Options ) --//

                }, me),
                onFail: $.proxy( function() {
                    jQuery.sap.log.error("Error: Failed to update the LinkTypes for the RefreshOptionalVariables function.");

                }, me)
            }); //-- END PART 2A ( Premise Link Types Options ) --//
            
            //------------------------------------------------//
            //-- PART 3A - Load the Room Types              --//
            //------------------------------------------------//
            IomyRe.common.LoadRoomTypes({
                onSuccess: $.proxy( function() {
                    //------------------------------------------------//
                    //-- PART 3B - Load the Premise Floor Options   --//
                    //------------------------------------------------//
                    IomyRe.common.LoadPremiseFloorsOptions({
                        onSuccess: $.proxy( function() {
                            //------------------------------------------------//
                            //-- PART 3C - Load the Premise Room Options    --//
                            //------------------------------------------------//
                            IomyRe.common.LoadPremiseRoomsOptions({
                                onSuccess: $.proxy( function() {
                                    
                                    
                                }, me),
                                onFail: $.proxy( function() {
                                    jQuery.sap.log.error("Error: Failed to update the PremiseRoomOptions for the RefreshOptionalVariables function.");
                                    
                                }, me)
                            }); //-- END PART 3C ( Premise Room Options ) --//
                            
                        }, me),
                        onFail: $.proxy( function() {
                            jQuery.sap.log.error("Error: Failed to update the PremiseRoomOptions for the RefreshOptionalVariables function.");
                            
                        }, me)
                    }); //-- END PART 3B ( Premise Floor Options ) --//
                        
                }, me),
                onFail: $.proxy( function() {
                    jQuery.sap.log.error("Error: Failed to update the RoomTypes for the RefreshOptionalVariables function.");
                    
                }, me)
            }); //-- END PART 3A ( Room Types ) --//
            
            
        } catch(e1) {
            jQuery.sap.log.error("RefreshOptionalVariables Error! "+e1.message);
        }
    },
    
    //================================================================//
    //== CURRENT USER INFORMATION                                   ==//
    //================================================================//
    RefreshUserInfoList : function (oConfig) {
        var me = this;
        
        IomyRe.apiodata.AjaxRequest({
            Url: IomyRe.apiodata.ODataLocation("users"),
            Columns: [
                "USERADDRESS_LINE1",        "USERADDRESS_LINE2",        "USERADDRESS_LINE3",        
                "USERADDRESS_SUBREGION",    "USERADDRESS_POSTCODE",     "REGION_PK",                
                "LANGUAGE_PK",              "TIMEZONE_PK",              "TIMEZONE_CC",              
                "TIMEZONE_LATITUDE",        "TIMEZONE_LONGITUDE",       "TIMEZONE_TZ",              
                "USERSINFO_PK",             "USERSINFO_TITLE",          "USERSINFO_DISPLAYNAME",    
                "USERS_USERNAME",           "USERSINFO_GIVENNAMES",      "USERSINFO_SURNAMES",
                "USERSINFO_EMAIL",          "USERSINFO_PHONENUMBER",    "USERSGENDER_PK",
                "USERS_PK",                 "USERS_USERNAME",           "PERMSERVER_ADDUSER"
            ],
            WhereClause: [],
            OrderByClause: [],
            onSuccess : function ( sResponseType, aData ) {
                IomyRe.common.UserInfo = {
                    "AddressLine1":       aData[0].USERADDRESS_LINE1,
                    "AddressLine2":       aData[0].USERADDRESS_LINE2,
                    "AddressLine3":       aData[0].USERADDRESS_LINE3,
                    "Postcode":           aData[0].USERADDRESS_POSTCODE,
                    "SubRegion":          aData[0].USERADDRESS_SUBREGION,
                    "RegionId":           aData[0].REGION_PK,
                    "LanguageId":         aData[0].LANGUAGE_PK,
                    "TimezoneId":         aData[0].TIMEZONE_PK,
                    "TimezoneCC":         aData[0].TIMEZONE_CC,
                    "TimezoneLatitude":   aData[0].TIMEZONE_LATITUDE,
                    "TimezoneLongitude":  aData[0].TIMEZONE_LONGITUDE,
                    "TimezoneTZ":         aData[0].TIMEZONE_TZ,
                    "UserInfoId":         aData[0].USERSINFO_PK,
                    "UserTitle":          aData[0].USERSINFO_TITLE,
                    "Displayname":        aData[0].USERSINFO_DISPLAYNAME,
                    "Givenname":          aData[0].USERSINFO_GIVENNAMES,
                    "Surname":            aData[0].USERSINFO_SURNAMES,
                    "Email":              aData[0].USERSINFO_EMAIL,
                    "Phone":              aData[0].USERSINFO_PHONENUMBER,
                    "Gender":             aData[0].USERSGENDER_PK,
                    "UserId":             aData[0].USERS_PK,
                    "Username":           aData[0].USERS_USERNAME,
                    "PermUserAdmin":      aData[0].PERMSERVER_ADDUSER
                };
                
                //-- Update the Timestamp on when the UserInfo was last updated --//
                IomyRe.common.UserInfoLastUpdate = new Date();
                
                //-- Store the Username --//
                IomyRe.common.CurrentUsername = aData[0].USERS_USERNAME;
                IomyRe.common.UserDisplayName = aData[0].USERSINFO_DISPLAYNAME;
                    
                //-- Perform the "onSuccess" function if applicable --//
                if(oConfig.onSuccess !== undefined) {
                    oConfig.onSuccess();
                }
            },
            
            onFail : function (response) {
                jQuery.sap.log.error("Error refreshing UserInfo list: "+JSON.stringify(response));
                
                //-- Perform the "onFail" function if applicable --//
                if(oConfig.onFail) {
                    oConfig.onFail();
                }
            }
        });
    },
    
    
    //================================================================//
    //== PREMISE LIST                                               ==//
    //================================================================//
    RefreshPremiseList : function (oConfig) {
        var me = this;
        
        IomyRe.apiodata.AjaxRequest({
            Url : IomyRe.apiodata.ODataLocation("premises"),
            Columns : [
                "PREMISE_PK", "PREMISE_NAME", "PREMISE_DESCRIPTION", "PERMPREMISE_WRITE", "PERMPREMISE_OWNER",
                "PREMISEFLOORS_PK", "PREMISEROOMS_PK", "PREMISEBEDROOMS_PK", "PREMISEOCCUPANTS_PK",
                "PREMISEFLOORS_NAME", "PREMISEROOMS_NAME", "PREMISEBEDROOMS_COUNT", "PREMISEOCCUPANTS_NAME",
                "PERMPREMISE_ROOMADMIN"
            ],
            WhereClause : [],
            OrderByClause : ["PREMISE_NAME asc"],
            
            onSuccess : function (responseType, data) {
                me.PremiseList = {};
                
                for (var i = 0; i < data.length; i++) {
                    me.PremiseList["_"+data[i].PREMISE_PK] = {
                        "Id" : data[i].PREMISE_PK,
                        "Name" : data[i].PREMISE_NAME,
                        "Desc" : data[i].PREMISE_DESCRIPTION,
                        "FloorCountId" : data[i].PREMISEFLOORS_PK,
                        "RoomCountId" : data[i].PREMISEROOMS_PK,
                        "BedroomCountId" : data[i].PREMISEBEDROOMS_PK,
                        "OccupantCountId" : data[i].PREMISEOCCUPANTS_PK,
                        "FloorCount" : data[i].PREMISEFLOORS_NAME,
                        "RoomCount" : data[i].PREMISEROOMS_NAME,
                        "BedroomCount" : data[i].PREMISEBEDROOMS_COUNT,
                        "OccupantCount" : data[i].PREMISEOCCUPANTS_NAME,
                        //-- Premise Permissions --//
                        "PermWrite" : data[i].PERMPREMISE_WRITE,
                        "PermOwner" : data[i].PERMPREMISE_OWNER,
                        "PermRoomAdmin" : data[i].PERMPREMISE_ROOMADMIN
                    };
                }
                
                //-- Update the Timestamp on when the PremiseList was last updated --//
                me.PremiseListLastUpdate = new Date();
                
                //-- Perform the "onSuccess" function if applicable --//
                if(oConfig.onSuccess) {
                    oConfig.onSuccess();
                }
            },
            
            onFail : function (response) {
                jQuery.sap.log.error("Error refreshing premise list: "+JSON.stringify(response));
                
                //-- Perform the "onFail" function if applicable --//
                if(oConfig.onFail) {
                    oConfig.onFail();
                }
            }
        });
    },
    
    //================================================================//
    //== HUB LIST                                                   ==//
    //================================================================//
    RefreshHubList : function (oConfig) {
        var me = this;
        
        IomyRe.apiodata.AjaxRequest({
            Url : IomyRe.apiodata.ODataLocation("hubs"),
            Columns : [
                "PERMPREMISE_READ",
                "PERMPREMISE_WRITE",
                "PERMPREMISE_STATETOGGLE",
                "PERMPREMISE_OWNER",
                "PREMISE_PK",
                "PREMISE_NAME",
                "HUB_PK",
                "HUB_NAME",
                "HUB_SERIALNUMBER",
                "HUB_IPADDRESS",
                "HUBTYPE_PK",
                "HUBTYPE_NAME"
            ],
            WhereClause : [],
            OrderByClause : ["PREMISE_NAME asc"],
            
            onSuccess : function (sResponseType, aData) {
                //-- Clear the HubList --//
                me.HubList = {};
                
                for (var i = 0; i < aData.length; i++) {
                    me.HubList["_"+aData[i].HUB_PK] = {
                        "PermRead":                    aData[i].PERMPREMISE_READ,
                        "PermWrite":                aData[i].PERMPREMISE_WRITE,
                        "PermOwner":                aData[i].PERMPREMISE_OWNER,
                        "PermTelnet":               0,
                        "PremiseId":                aData[i].PREMISE_PK,
                        "PremiseName":                aData[i].PREMISE_NAME,
                        "HubId":                    aData[i].HUB_PK,
                        "HubName":                  aData[i].HUB_NAME,
                        "HubSerial":                aData[i].HUB_SERIALNUMBER,
                        "HubIPAddress":             aData[i].HUB_IPADDRESS,
                        "HubTypeId":                aData[i].HUBTYPE_PK,
                        "HubTypeName":              aData[i].HUBTYPE_NAME
                    };
                    
                    if (me.HubList["_"+aData[i].HUB_PK].HubTypeId == 2 &&
                        me.HubList["_"+aData[i].HUB_PK].PermOwner == 1)
                    {
                        me.HubList["_"+aData[i].HUB_PK].PermTelnet = 1;
                    }
                }
                
                //-- Update the Timestamp on when the HubList was last updated --//
                me.HubListLastUpdate = new Date();
                //console.log(JSON.stringify(me.HubList));
                //-- Perform the "onSuccess" function if applicable --//
                if(oConfig.onSuccess) {
                    oConfig.onSuccess();
                }
            },
            
            onFail : function (response) {
                jQuery.sap.log.error("Error refreshing gateway list: "+JSON.stringify(response));
                //-- Perform the "onFail" function if applicable --//
                if(oConfig.onFail) {
                    oConfig.onFail();
                }
            }
        });
    },
    
    //================================================================//
    //== Retrieve the Rooms List from the database                    ==//
    //================================================================//
    RetreiveRoomList: function( oConfig ) {
        var me = this; 
        
        //------------------------------------//
        //-- ODATA REQUEST PREP                --//
        //------------------------------------//
        var sUrl            = IomyRe.apiodata.ODataLocation("rooms");
        var aColumns        = [ "ROOMS_PREMISE_FK", "ROOMS_PK", "ROOMS_NAME", "ROOMS_DESC", "ROOMS_FLOOR", "ROOMTYPE_PK", "ROOMTYPE_NAME", "ROOMTYPE_OUTDOORS", "PERMROOMS_READ", "PERMROOMS_WRITE", "PERMROOMS_STATETOGGLE", "PERMROOMS_DATAREAD" ];
        var aWhere            = [];
        var aOrderBy        = [ "ROOMS_PREMISE_FK", "ROOMTYPE_OUTDOORS", "ROOMS_PK" ];
        
        me.RoomsList = {};
        me.AllRoomsList = {};
        
        //------------------------//
        //-- ODATA REQUEST        --//
        //------------------------//
        IomyRe.apiodata.AjaxRequest( {
            Url:                sUrl,
            HTTPMethod:            "GET",
            DataType:            "json",
            Columns:            aColumns,
            WhereClause:        aWhere,
            OrderByClause:        aOrderBy,
            
            //----------------------------//
            //-- 3.A - ON AJAX FAILURE    --//
            //----------------------------//
            onFail : function(response) {
                jQuery.sap.log.error("RoomLookup Error!");
                
                //-- Perform the "onFail" function if applicable --//
                if(oConfig.onFail) {
                    oConfig.onFail();
                }
            },
        
            //--------------------------------//
            //-- 3.B - ON AJAX SUCCESS        --//
            //--------------------------------//
            onSuccess : $.proxy(function(sReturnDataType, AjaxData) {
                try {
                    
                    var iPremiseId        = 0;            //-- INTEGER:    --//
                    var iRoomId            = 0;            //-- INTEGER:    --//
                    var aTemp            = {};            //-- ARRAY:        Temporary Associative array used to temporarily store room data --//
                    
                    //--------------------------------------------------------//
                    //-- 3.B.A - Check to see how many rooms are found    --//
                    //--------------------------------------------------------//
                    if( AjaxData.length >= 1 ) {
                        //--------------------------------------------------------//
                        //-- 3.B.A.1 - Store the Data in the Rooms List            --//
                        //--------------------------------------------------------//
                        for (var i = 0; i < AjaxData.length; i++) {
                            
                            iPremiseId        = parseInt( AjaxData[i].ROOMS_PREMISE_FK );
                            iRoomId            = parseInt( AjaxData[i].ROOMS_PK );
                            
                            if( iPremiseId>=1 && iRoomId>=1 ) {
                                //------------------------------------------------------------//
                                //-- 3.B.A.1.2 - Check if the Premise Id needs to be setup    --//
                                //------------------------------------------------------------//
                                if( !IomyRe.common.RoomsList["_"+iPremiseId] ) {
                                    //-- Create the Premise --//
                                    IomyRe.common.RoomsList["_"+iPremiseId] = {};
                                }
                                
                                //------------------------------------------------------------//
                                //-- 3.B.A.1.3 - Check if the Room needs to be setup        --//
                                //------------------------------------------------------------//
                                if( !IomyRe.common.RoomsList["_"+iPremiseId]["_"+iRoomId] ) {
                                    //-- Create the Room --//
                                    IomyRe.common.RoomsList["_"+iPremiseId]["_"+iRoomId] = {};
                                }
                                
                                //-- Reset the array --//
                                aTemp    = {};
                                
                                //-- Store the values --//
                                aTemp.PremiseId                = iPremiseId;
                                aTemp.PremiseName            = "";
                                
                                aTemp.RoomId                = iRoomId;
                                aTemp.RoomName                = AjaxData[i].ROOMS_NAME;
                                aTemp.RoomDesc                = AjaxData[i].ROOMS_DESC;
                                aTemp.RoomFloor                = AjaxData[i].ROOMS_FLOOR;
                                aTemp.RoomTypeId            = parseInt( AjaxData[i].ROOMTYPE_PK );
                                aTemp.RoomTypeName            = AjaxData[i].ROOMTYPE_NAME;
                                aTemp.RoomTypeOutdoors        = parseInt( AjaxData[i].ROOMTYPE_OUTDOORS );
                                
                                aTemp.PermRead                = parseInt( AjaxData[i].PERMROOMS_READ );
                                aTemp.PermWrite                = parseInt( AjaxData[i].PERMROOMS_WRITE );
                                aTemp.PermStateToggle        = parseInt( AjaxData[i].PERMROOMS_STATETOGGLE );
                                aTemp.PermDeviceRead        = parseInt( AjaxData[i].PERMROOMS_DATAREAD );
                                
                                //-- Lookup the Premise Name and position in the PremiseList --//
                                $.each( IomyRe.common.PremiseList, function( Key, aPremise ) {
                                    if( aPremise.Id===iPremiseId.toString() ) {
                                        //-- Add the Premise Name --//
                                        aTemp.PremiseName     = aPremise.Name;
                                        //-- NOTE: This will need to be removed if we convert the RoomList from an iterative array to a associative array --//
                                        aTemp.PremiseListKey = Key;
                                    }
                                });
                                
                                //-- Array to store the Things in --//
                                aTemp.Things    = {};
                                
                                if( !IomyRe.common.RoomsList["_"+iPremiseId] ) {
                                    IomyRe.common.RoomsList["_"+iPremiseId] = {};
                                }
                                
                                IomyRe.common.RoomsList["_"+iPremiseId]["_"+iRoomId] = {};
                                
                                IomyRe.common.RoomsList["_"+iPremiseId]["_"+iRoomId] = aTemp;
                                
                                IomyRe.common.AllRoomsList["_"+iRoomId] = aTemp;
                            } else {
                                $.sap.log.error("Invalid PremiseId or RoomId");
                            }  
                        }
                    }
                    
                    //-- Update the Timestamp on when the RoomsList was last updated --//
                    me.RoomsListLastUpdate = new Date();
                    
                    //-- Perform the "onSuccess" function if applicable --//
                    if(oConfig.onSuccess) {
                        oConfig.onSuccess();
                    }
                    
                } catch(e11) {
                    $.sap.log.error("LoginRoomsList Error 11: "+e11.message);
                    //-- Perform the "onFail" function if applicable --//
                    if(oConfig.onFail) {
                        oConfig.onFail();
                    }
                }
            })
        });
    },
    
    RetrieveRoomAdminRoomList : function (mSettings) {
        var oModule         = this;
        var bError          = false;
        var sUrl            = IomyRe.apiphp.APILocation("rooms");
        var fnSuccess       = function () {};
        var fnFail          = function () {};
        var iPremiseId      = 0;
        
        //--------------------------------------------------------------------//
        // Find the premise ID.
        //--------------------------------------------------------------------//
        if (mSettings !== undefined && mSettings !== null) {
            if (mSettings.premiseID !== undefined && mSettings.premiseID !== null) {
                iPremiseId = mSettings.premiseID;
                
            }
            
            if (mSettings.onSuccess !== undefined && mSettings.onSuccess !== null) {
                fnSuccess = mSettings.onSuccess;
            }
            
            if (mSettings.onFail !== undefined && mSettings.onFail !== null) {
                fnFail = mSettings.onFail;
            }
            
        }
        
        //-- Clear the list --//
        oModule.RoomAdminRoomsList = {};
        
        //--------------------------------------------------------------------//
        // Attempt to retrieve the room admin's room list.
        //--------------------------------------------------------------------//
        if (!bError) {
            if (iPremiseId > 0) {
                try {
                    //--------------------------------------------------------//
                    // Run the request using a given premise ID.
                    //--------------------------------------------------------//
                    IomyRe.apiphp.AjaxRequest({
                        url     : sUrl,
                        data    : {
                            "Mode":      "RoomAdminRoomList",
                            "PremiseId": iPremiseId
                        },

                        onSuccess : function (sDataType, aData) {
                            try {
                                if (aData.Error !== true) {
                                    var mTemp;

                                    for (var i = 0; i < aData.Data.length; i++) {
                                        mTemp = aData.Data[i];

                                        oModule.RoomAdminRoomsList["_"+mTemp.RoomId] = mTemp;
                                    }

                                    fnSuccess();
                                } else {
                                    $.sap.log.error(aData.ErrMesg);
                                    fnFail(aData.ErrMesg);
                                }

                            } catch (e) {
                                $.sap.log.error("Error processing Admin's room list ("+e.name+"): " + e.message);
                            }
                        },

                        onFail : function (response) {
                            try {
                                $.sap.log.error("Error loading the room admin's room list: " + response.responseText);
                                fnFail(response.responseText);

                            } catch (e) {
                                $.sap.log.error("Error in the failure callback of IomyRe.common.RetrieveRoomAdminRoomList ("+e.name+"): " + e.message);
                            }
                        }

                    });
                } catch (e) {
                    $.sap.log.error("Error attempting to retrieve the room admin's room list ("+e.name+"): " + e.message);
                }
            } else {
                try {
                    //--------------------------------------------------------//
                    // No premise was given so prepare requests for each
                    // premise.
                    //--------------------------------------------------------//
                    var oQueue = new AjaxRequestQueue({
                        concurrentRequests  : 2,
                        executeNow          : false
                    });

                    $.each(IomyRe.common.PremiseList, function (sI, mPremise) {

                        try {
                            oQueue.addRequest({
                                library : "php",
                                url     : sUrl,
                                data    : {
                                    "Mode":      "RoomAdminRoomList",
                                    "PremiseId": mPremise.Id
                                },

                                onSuccess : function (sDataType, aData) {
                                    try {
                                        if (aData.Error !== true) {
                                            var mTemp;

                                            for (var i = 0; i < aData.Data.length; i++) {
                                                mTemp = aData.Data[i];

                                                oModule.RoomAdminRoomsList["_"+mTemp.RoomId] = mTemp;
                                            }

                                            fnSuccess();
                                        } else {
                                            $.sap.log.error(aData.ErrMesg);
                                            fnFail(aData.ErrMesg);
                                        }

                                    } catch (e) {
                                        $.sap.log.error("Error processing Admin's room list ("+e.name+"): " + e.message);
                                    }
                                },

                                onFail : function (response) {
                                    try {
                                        $.sap.log.error("Error loading the room admin's room list: " + response.responseText);
                                        fnFail(response.responseText);

                                    } catch (e) {
                                        $.sap.log.error("Error in the failure callback of IomyRe.common.RetrieveRoomAdminRoomList ("+e.name+"): " + e.message);
                                    }
                                }

                            });
                            
                        } catch (e) {
                            $.sap.log.error("Error preparing the admin room list request ("+e.name+"): " + e.message);
                        }

                    });
                    
                    //-- Run all of the requests. --//
                    oQueue.execute();
                } catch (e) {
                    $.sap.log.error("Error attempting to retrieve the room admin's room list with multiple premises ("+e.name+"): " + e.message);
                }
            }
                
        }
    },
    
    /**
     * Loads/reloads the Comm List into memory.
     * 
     * @param {type} oConfig
     */
    RefreshCommList : function (oConfig) {
        var me = this; 
        
        //------------------------------------//
        //-- ODATA REQUEST PREP                --//
        //------------------------------------//
        var sUrl            = IomyRe.apiodata.ODataLocation("comms");
        var aColumns        = [ "COMM_PK", "COMM_NAME", "COMM_JOINMODE", "COMM_ADDRESS", "COMMTYPE_PK", "COMMTYPE_NAME", "HUB_PK", "HUB_NAME", "PREMISE_PK", "PREMISE_NAME" ];
        var aWhere          = [];
        var aOrderBy        = [ "COMM_PK", "HUB_PK" ];
        
        me.CommList = {};
        //------------------------//
        //-- ODATA REQUEST        --//
        //------------------------//
        IomyRe.apiodata.AjaxRequest( {
            Url:                sUrl,
            HTTPMethod:            "GET",
            DataType:            "json",
            Columns:            aColumns,
            WhereClause:        aWhere,
            OrderByClause:        aOrderBy,
            
            //----------------------------//
            //-- 3.A - ON AJAX FAILURE    --//
            //----------------------------//
            onFail : function(response) {
                jQuery.sap.log.error("CommLookup Error! " + response.responseText);
                
                //-- Perform the "onFail" function if applicable --//
                if(oConfig.onFail) {
                    oConfig.onFail();
                }
            },
        
            //--------------------------------//
            //-- 3.B - ON AJAX SUCCESS        --//
            //--------------------------------//
            onSuccess : $.proxy(function(sReturnDataType, AjaxData) {
                try {
                    
                    var iCommId            = 0;            //-- INTEGER:    --//
                    var iHubId            = 0;            //-- INTEGER:    --//
                    var iPremiseId        = 0;            //-- INTEGER:    --//
                    var aTemp            = {};            //-- ARRAY:        Temporary Associative array used to temporarily store comm data --//
                    var mData            = {};            //-- MAP:        Temporary JS object containing 
                    
                    //--------------------------------------------------------//
                    //-- 3.B.A - Check to see how many comms are found    --//
                    //--------------------------------------------------------//
                    if( AjaxData.length >= 1 ) {
                        //--------------------------------------------------------//
                        //-- 3.B.A.1 - Store the Data in the Comm List            --//
                        //--------------------------------------------------------//
                        for (var i = 0; i < AjaxData.length; i++) {
                            mData = AjaxData[i];
                            
                            iCommId            = parseInt( mData.COMM_PK );
                            iHubId            = parseInt( mData.HUB_PK );
                            iPremiseId        = parseInt( mData.PREMISE_PK );

                            //-- Reset the array --//
                            aTemp    = {};

                            //-- Store the values --//
                            aTemp.CommId                = iCommId;
                            aTemp.CommName                = mData.COMM_NAME;
                            aTemp.CommJoinMode            = mData.COMM_JOINMODE;
                            aTemp.CommAddress            = mData.COMM_ADDRESS;
                            aTemp.CommTypeId            = mData.COMMTYPE_PK;
                            aTemp.CommTypeName            = mData.COMMTYPE_NAME;

                            aTemp.HubId                    = iHubId;
                            aTemp.HubName                = mData.HUB_NAME;
                            
                            aTemp.PremiseId                = iPremiseId;
                            aTemp.PremiseName            = mData.PREMISE_NAME;

                            IomyRe.common.CommList["_"+iCommId] = aTemp;
                            
                        }
                    } 
                    
                    //-- Update the Timestamp on when the CommList was last updated. --//
                    me.CommListLastUpdate = new Date();
                    
                    //-- Perform the "onSuccess" function if applicable --//
                    if(oConfig.onSuccess !== undefined) {
                        oConfig.onSuccess();
                    }
                    
                } catch(e11) {
                    jQuery.sap.log.error("Comm List Load error: "+e11.message);
                    
                    //-- Perform the "onFail" function if applicable --//
                    if(oConfig.onFail) {
                        oConfig.onFail();
                    }
                }
            })
        });
    },
    
    //================================================================//
    //== Retrieve Link Information                                    ==//
    //================================================================//
    RetrieveLinkList : function (oConfig) {
        var me = this;
        
        IomyRe.apiodata.AjaxRequest({
            Url : IomyRe.apiodata.ODataLocation("link"),
            Columns : [
                "ROOMS_PREMISE_FK","LINK_PK","LINK_SERIALCODE","LINK_NAME","LINK_CONNECTED",
                "LINK_STATE","LINKTYPE_PK","LINKTYPE_NAME","ROOMS_PK",
                "LINKCONN_PK","LINKCONN_NAME","LINKCONN_ADDRESS","LINKCONN_USERNAME",
                "LINKCONN_PASSWORD","LINKCONN_PORT","LINK_COMM_FK"
            ],
            WhereClause : [],
            OrderByClause : ["LINK_PK asc"],
            
            onSuccess : function (responseType, data) {
                me.LinkList = {};
                
                for (var i = 0; i < data.length; i++) {
                    me.LinkList["_"+data[i].LINK_PK] = {
                        "LinkId" : data[i].LINK_PK,
                        "LinkName" : data[i].LINK_NAME,
                        "LinkSerialCode" : data[i].LINK_SERIALCODE,
                        "LinkConnected" : data[i].LINK_CONNECTED,
                        "LinkState" : data[i].LINK_STATE,
                        "LinkRoomId" : data[i].ROOMS_PK,
                        "LinkTypeId" : data[i].LINKTYPE_PK,
                        "LinkTypeName" : data[i].LINKTYPE_NAME,
                        "LinkConnId" : data[i].LINKCONN_PK,
                        "LinkConnName" : data[i].LINKCONN_NAME,
                        "LinkConnAddress" : data[i].LINKCONN_ADDRESS,
                        "LinkConnUsername" : data[i].LINKCONN_USERNAME,
                        "LinkConnPassword" : data[i].LINKCONN_PASSWORD,
                        "LinkConnPort" : data[i].LINKCONN_PORT,
                        "PremiseId" : data[i].ROOMS_PREMISE_FK,
                        "CommId" : data[i].LINK_COMM_FK
                    };
                }
                
                //--------------------------------------------------------//
                // ONLY add these hard-coded devices if user is 'demo',
                // our debug user.
                //--------------------------------------------------------//
//                if (IomyRe.common.CurrentUsername === "demo") {
//                    IomyRe.experimental.addDemoDataToLinkList();
//                }
                
                //-- Perform the "onSuccess" function if applicable --//
                if(oConfig.onSuccess !== undefined) {
                    oConfig.onSuccess();
                }
            },
            
            onFail : function (response) {
                jQuery.sap.log.error("Error refreshing link list: "+JSON.stringify(response));
                
                //-- Perform the "onFail" function if applicable --//
                if(oConfig.onFail) {
                    oConfig.onFail();
                }
            }
        });
    },
    
    //============================================================================================//
    //== REFRESH THE THINGLIST                                                                  ==//
    //============================================================================================//
    //-- Description: This function is used to create an updated "ThingList" so that it can     --//
    //--    replace the existing version. Many pages require this list to be setup in order for --//
    //--    those pages to be able to work.                                                     --//
    //--------------------------------------------------------------------------------------------//
    RefreshThingList: function( oConfig ) {
        //---------------------------------------------------------------------------//
        //-- NOTE: aConfig is an associative array that has the following elements --//
        //---------------------------------------------------------------------------//
        //-- @onSuccess               (optional) FUNCTION    - This is for queueing up functions to run if the Ajax request is successful.                                       --//
        
        //------------------------------------------------//
        //-- 1.0 - Initialise Variables                 --//
        //------------------------------------------------//
        var oScope                  = this;         //-- OBJECT:    Used to bind the scope to an object for sub-function if they need it.                                   --//
        var aThingList              = {};           //-- ARRAY:     The new updated "ThingList" that is being built to replace the existing ThingList in the commons Lib.   --//
        
        var iTempLinkId             = 0;            //-- INTEGER:   Commonly used variable. Holds the "Link Id" which is used several times in this function.               --//
        var iTempThingId            = 0;            //-- INTEGER:   Commonly used variable. Holds the "Thing Id" which is used several times in this function.              --//
        var iTempIOId               = 0;            //-- INTEGER:   Commonly used variable. Holds the "IO Id" of the IO that is currently being processed.                  --//
        var iPreviousThingId        = -10;          //-- INTEGER:   Used to store what was the current "Thing Id" so that if it changes then it knows it needs creating     --//
        var oTempThing              = {};           //-- OBJECT:    Used to create an associative array that holds the relevant data about the Thing and its Link and IOs   --//
        var oTempIO                 = {};           //-- OBJECT:    Used to create the IO associative array. This and the oTempThing may end up be coming                   --//
        
        //------------------------------------------------//
        //-- 2.0 - Start the Ajax Request               --//
        //------------------------------------------------//
        try {
            IomyRe.apiphp.AjaxRequest({
                //-- Set the URL to the IODetection --//
                url: IomyRe.apiphp.APILocation("iodetection"),
                //-- The Data and MimeTypes can be left on the default values --//
                //-- On Success --//
                onSuccess:$.proxy(function(sDataType, data) {
                    //----------------------------------------------------------------//
                    //-- 2.A.1.0 - Foreach IO from the IODetect API                 --//
                    //----------------------------------------------------------------//
                    $.each( data,function(index, aIO) {
                        try {
                            //--------------------------------------------------------------------//
                            //-- 2.A.1.1 - PREP: Store commonly used Temporary variables        --//
                            //--------------------------------------------------------------------//
                            iTempLinkId     = aIO.LinkId;
                            iTempThingId    = aIO.ThingId;
                            iTempIOId       = aIO.IOId;
                            
                            //--------------------------------------------------------------------//
                            //-- 2.A.1.3 - STEP 2: Device List Thing                            --//
                            //--------------------------------------------------------------------//
                            if( iPreviousThingId!==iTempThingId ) {
                                //-- Check to see if the device exists --//
                                if( ! aThingList["_"+iTempThingId] ) {
                                    //--------------------------------------------------------//
                                    //-- Add the missing "Thing"                            --//
                                    //--------------------------------------------------------//
                                    
                                    //-- Wipe the variable --//
                                    oTempThing = {};
                                    
                                    //-- Add the Id to the array --//
                                    oTempThing.Id                  = iTempThingId;
                                    
                                    //-- Add the basic Thing information for the Thing --//
                                    oTempThing.DisplayName         = aIO.ThingName;
                                    
                                    //-- Add the Thing Status (THING_STATE) --//
                                    oTempThing.Status              = aIO.ThingStatus;
                                    
                                    //-- Thing Type --//
                                    oTempThing.TypeId              = aIO.ThingTypeId;
                                    oTempThing.TypeName            = aIO.ThingTypeName;
                                    
                                    //-- Add the basic Link information for the device --//
                                    oTempThing.LinkId              = iTempLinkId;
                                    oTempThing.LinkDisplayName     = aIO.LinkDisplayName;
                                    oTempThing.LinkStatus          = aIO.LinkStatus;
                                    
                                    //-- Add the Premise Id --//
                                    oTempThing.PremiseId           = aIO.PremiseId;
                                    //-- Add the Room Id (if a room is assigned) --//
                                    oTempThing.RoomId              = aIO.RoomId;
                                    
                                    //-- Store the Permissions --//
                                    oTempThing.PermRead            = aIO.PermissionRead;
                                    oTempThing.PermWrite           = aIO.PermissionWrite;
                                    oTempThing.PermToggle          = aIO.PermissionStateToggle;
                                    
                                    //-- Store when this thing was last updated --//
                                    oTempThing.UILastUpdate        = new Date();
                                    
                                    //-- Store references to the widgets containing display names. --//
                                    oTempThing.LabelWidgets        = [];
                                    
                                    //-- Add an associative array for the IOs --//
                                    oTempThing.IO                  = {};
                                    
                                    //--------------------------------------------------------//
                                    //-- Add the thing                                      --//
                                    //--------------------------------------------------------//
                                    aThingList["_"+iTempThingId]  = oTempThing;
                                    
                                    //--------------------------------------------------------//
                                    //-- Check that the Premise is setup in the Rooms List  --//
                                    //--------------------------------------------------------//
                                    if( !!IomyRe.common.RoomsList["_"+aIO.PremiseId] ) {
                                        //-- Do nothing --//
                                        
                                    } else {
                                        //-- Setup the PremiseId in the RoomsList global variable --//
                                        IomyRe.common.RoomsList["_"+aIO.PremiseId] = {};
                                    }
                                    
                                    
                                    //--------------------------------------------------------//
                                    //-- Check if the Room isn't valid                      --//
                                    //--------------------------------------------------------//
                                    if( !(aIO.RoomId >= 1) || !IomyRe.common.RoomsList["_"+aIO.PremiseId]["_"+aIO.RoomId] ) {
                                        //--------------------------------------------------------//
                                        //-- CHECK IF THE "Unassigned" ROOM DOESN'T EXIST       --//
                                        //--------------------------------------------------------//
                                        if( !IomyRe.common.RoomsList["_"+aIO.PremiseId].Unassigned ) {
                                            //-- CREATE THE "UNASSIGNED" ROOM --//
                                            IomyRe.common.RoomsList["_"+aIO.PremiseId].Unassigned = { 
                                                "PremiseId":        aIO.PremiseId,
                                                "PremiseName":      aIO.PremiseName,
                                                "RoomId":           null,
                                                "RoomName":         "Unassigned",
                                                "Things":           {} 
                                            };
                                        }
                                        //--------------------------------------------------------//
                                        //-- STORE THE THING IN THE "UNASSIGNED"                --//
                                        //--------------------------------------------------------//
                                        IomyRe.common.RoomsList["_"+aIO.PremiseId].Unassigned.Things["_"+iTempThingId] = {
                                            "Link":     iTempLinkId,
                                            "Thing":    iTempThingId
                                        }
                                        
                                    } else {
                                        //--------------------------------------------------------//
                                        //-- STORE THE THING IN THE ROOM                        --//
                                        //--------------------------------------------------------//
                                        IomyRe.common.RoomsList["_"+aIO.PremiseId]["_"+aIO.RoomId].Things["_"+iTempThingId] = {
                                            "Link":     iTempLinkId,
                                            "Thing":    iTempThingId
                                        }
                                        
                                    }
                                    
                                }    //-- End if to verify if the device exists --//
                                //--------------------------------------------------------------//
                                //-- Store the Current "LinkId" as the previous "LinkId"      --//
                                //--------------------------------------------------------------//
                                iPreviousLinkId = iTempLinkId;
                            }
                            
                            //------------------------------------------------------------//
                            //-- 2.A.1.4 - STEP 3: Add the IO                           --//
                            //------------------------------------------------------------//
                            
                            //-- Add an Associative Array for the IO to be stored in --//
                            oTempIO = {};
                            
                            //------------------------------------------------------------//
                            //-- Part A - IO Info                                       --//
                            //------------------------------------------------------------//
                            //-- Add the IO Id --//
                            oTempIO.Id              = aIO.IOId;
                            //-- Add the IO DisplayName --//
                            oTempIO.Name            = aIO.IOName;
                            //-- Add the IO Status --//
                            oTempIO.Status          = aIO.IOStatus;
                            //-- Add the IO Type Id --//
                            oTempIO.TypeId          = aIO.IOTypeId;
                            //-- Add the IO DataType --//
                            oTempIO.DataType        = aIO.DataType;
                            //-- Add the IO DataTypeName --//
                            oTempIO.DataTypeName    = aIO.DataTypeName;
                            //-- Add the IO DataType Enumeration Flags --//
                            oTempIO.DataTypeEnum    = aIO.DataTypeEnum;
                            //-- Add the IO SampleRate --//
                            oTempIO.Samplerate      = aIO.IOSamplerate;
                            //-- Add the IO SampleRateLimit --//
                            oTempIO.SamplerateLimit = aIO.IOSamplerateLimit;
                            //-- Add the IO ConvertRate --//
                            oTempIO.Convertrate     = aIO.IOConvertRate;
                            
                            //------------------------------------------------------------//
                            //-- Part B - IO UoM                                        --//
                            //------------------------------------------------------------//
                            
                            //-- Add the IO UoM Id --//
                            oTempIO.UoMId          = aIO.UomId;
                            //-- Add the IO UoM Name --//
                            oTempIO.UoMName        = aIO.UomName;
                            //-- Add the IO UoMSubCat Id --//
                            oTempIO.UoMSubCatId    = aIO.UomSubCatId;
                            //-- Add the IO UoMSubCat Name --//
                            oTempIO.UoMSubCatName  = aIO.UomSubCatName;
                            //-- Add the IO UoMCat Id --//
                            oTempIO.UoMCatId       = aIO.UomCatId;
                            //-- Add the IO UoMCat Name --//
                            oTempIO.UoMCatName     = aIO.UomCatName;
                            
                            //------------------------------------------------------------//
                            //-- Part C - IO Resource Categorization                    --//
                            //------------------------------------------------------------//
                            //-- Add the IO RSCat Id --//
                            oTempIO.RSCatId        = aIO.RSCatId;
                            //-- Add the IO RSSubCat Id --//
                            oTempIO.RSSubCatId     = aIO.RSSubCatId;
                            //-- Add the IO RSSubCat Name --//
                            oTempIO.RSSubCatName   = aIO.RSSubCatName;
                            //-- Add the IO RSSubCat Type --//
                            oTempIO.RSSubCatType   = aIO.RSSubCatType;
                            //-- Add the IO RSTariff Id --//
                            oTempIO.RSTariffId     = aIO.RSTariffId;
                            //-- TODO: Add a Tariff code (to indicate which Tariff of that type) to the Database and API --//
                            
                            //-- Add the IO RSType Id --//
                            oTempIO.RSTypeId       = aIO.RSTypeId;
                            //-- Add the IO RSType Main Flag --//
                            oTempIO.RSTypeMain     = aIO.RSTypeMain;
                            
                            //------------------------------------------------------------//
                            //-- Add the IO to the device list                          --//
                            //------------------------------------------------------------//
                            aThingList["_"+iTempThingId].IO["_"+iTempIOId] = oTempIO;
                            
                            
                            
                        } catch(e2) {
                            jQuery.sap.log.error("CriticalErrorIODetect: "+e2.message, "", "IO Detection");
                        }
                    }); //-- End of foreach loop ($.each) --//
                    
                    //----------------------------------------------------------------//
                    //-- Store the Lists in global variables so the                 --//
                    //-- other UI components can use them.                          --//
                    //----------------------------------------------------------------//
                    try {
                        IomyRe.common.ThingList = aThingList;
                    } catch(e1234) {
                        jQuery.sap.log.error("Problem Mapping ThingList: "+e1234.message, "", "IO Detection");
                    }
                    
                    //--------------------------------------------------------//
                    // ONLY add these hard-coded devices if user is 'demo'.
                    //--------------------------------------------------------//
//                    if (IomyRe.common.CurrentUsername === "demo") {
//                        IomyRe.experimental.addDemoDataToThingList();
//                    }
                    
                    //----------------------------------------------------------------//
                    //-- 8.0 - DEBUGGING                                            --//
                    //----------------------------------------------------------------//
                    var sTemp = "=================================\n";
                    jQuery.sap.log.debug( sTemp+"== common.ThingList           ==\n"+JSON.stringify(IomyRe.common.ThingList), "", "IO Detection");
                    
                    //-- Update the Timestamp on when the ThingList was last updated --//
                    IomyRe.common.ThingListLastUpdate = new Date();
                    
                    //----------------------------------------------------------------//
                    //-- 9.0 - FINALISE BY TRIGGERING THE NEXT TASK                 --//
                    //----------------------------------------------------------------//
                    if(oConfig.onSuccess) {
                        
                        IomyRe.common.bCoreRefreshInProgress = false;
                        
                        oConfig.onSuccess();
                    }
                    
                },oScope),     //-- End of "OnSuccess" Ajax Request --//
                
                onFail : function (response) {
                    jQuery.sap.log.error("Error refreshing thing list: "+JSON.stringify(response));
                    //-- Perform the "onFail" function if applicable --//
                    if(oConfig.onFail) {
                        oConfig.onFail();
                    }
                }
            }); //-- End of Ajax Request --//
            //
            
        } catch(e1) {
            IomyRe.common.bCoreRefreshInProgress = false;
            jQuery.sap.log.error( "RefreshThingList: "+e1.message, "", "IO Detection");
            
            //-- Perform the "onFail" function if applicable --//
            if(oConfig.onFail) {
                oConfig.onFail();
            }
        }
    },
    
    LoadRegions : function (mSettings) {
        var me = this;
        var fnSuccess;
        var fnFail;
        
        //--------------------------------------------------------------------//
        // Check the settings map for the two callback functions.
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //-- Success callback --//
            if (mSettings.onSuccess === undefined) {
                fnSuccess = function () {};
            } else {
                fnSuccess = mSettings.onSuccess;
            }
            
            //-- Failure callback --//
            if (mSettings.onFail === undefined) {
                fnFail = function () {};
            } else {
                fnFail = mSettings.onFail;
            }
        } else {
            fnSuccess   = function () {};
            fnFail      = function () {};
        }
        
        IomyRe.apiodata.AjaxRequest({
            Url : IomyRe.apiodata.ODataLocation("regions"),
            Columns : ["REGION_NAME", "REGION_PK", "REGION_NAME2"],
            WhereClause : [],
            OrderByClause : ["REGION_NAME asc"],

            onSuccess : function (responseType, data) {
                try {
                    me.Regions = {};
                    
                    for (var i = 0; i < data.length; i++) {
                        me.Regions["_"+data[i].REGION_PK] = {
                            RegionId            : data[i].REGION_PK,
                            RegionName          : data[i].REGION_NAME,
                            RegionAbbreviation  : data[i].REGION_NAME2
                        };
                    }
                    
                    me.bRegionsLoaded = true;
                    fnSuccess();
                } catch (e) {

                    jQuery.sap.log.error("Error gathering Regions: "+JSON.stringify(e.message));
                    me.bRegionsLoaded = false;
                    fnFail();
                }
            },

            onFail : function (response) {
                jQuery.sap.log.error("Error loading regions OData: "+JSON.stringify(response));
                me.bRegionsLoaded = false;
                fnFail();
            }
            
        });
    },
    
    LoadLanguages : function (mSettings) {
        var me = this;
        var fnSuccess;
        var fnFail;
        
        //--------------------------------------------------------------------//
        // Check the settings map for the two callback functions.
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //-- Success callback --//
            if (mSettings.onSuccess === undefined) {
                fnSuccess = function () {};
            } else {
                fnSuccess = mSettings.onSuccess;
            }
            
            //-- Failure callback --//
            if (mSettings.onFail === undefined) {
                fnFail = function () {};
            } else {
                fnFail = mSettings.onFail;
            }
        } else {
            fnSuccess   = function () {};
            fnFail      = function () {};
        }
        
        IomyRe.apiodata.AjaxRequest({
            Url : IomyRe.apiodata.ODataLocation("language"),
            Columns : ["LANGUAGE_PK","LANGUAGE_NAME"],
            WhereClause : [],
            OrderByClause : ["LANGUAGE_NAME asc"],

            onSuccess : function (responseType, data) {
                try {
                    me.Languages = {};
                    
                    for (var i = 0; i < data.length; i++) {
                        me.Languages["_"+data[i].LANGUAGE_PK] = {
                            LanguageId : data[i].LANGUAGE_PK,
                            LanguageName : data[i].LANGUAGE_NAME
                        };
                    }
                    
                    me.bLanguagesLoaded = true;
                    fnSuccess();
                } catch (e) {

                    jQuery.sap.log.error("Error gathering Languages: "+JSON.stringify(e.message));
                    me.bLanguagesLoaded = false;
                    fnFail();
                }
            },

            onFail : function (response) {
                jQuery.sap.log.error("Error loading languages OData: "+JSON.stringify(response));
                me.bLanguagesLoaded = false;
                fnFail();
            }
        });
    },
    
    LoadTimezones : function (mSettings) {
        var me = this;
        var fnSuccess;
        var fnFail;
        
        //--------------------------------------------------------------------//
        // Check the settings map for the two callback functions.
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //-- Success callback --//
            if (mSettings.onSuccess === undefined) {
                fnSuccess = function () {};
            } else {
                fnSuccess = mSettings.onSuccess;
            }
            
            //-- Failure callback --//
            if (mSettings.onFail === undefined) {
                fnFail = function () {};
            } else {
                fnFail = mSettings.onFail;
            }
        } else {
            fnSuccess   = function () {};
            fnFail      = function () {};
        }
        
        IomyRe.apiodata.AjaxRequest({
            Url : IomyRe.apiodata.ODataLocation("timezones"),
            Columns : ["TIMEZONE_PK","TIMEZONE_TZ","TIMEZONE_CC"],
            WhereClause : [],
            OrderByClause : ["TIMEZONE_TZ asc"],

            onSuccess : function (responseType, data) {
                try {
                    me.Timezones = {};
                    
                    for (var i = 0; i < data.length; i++) {
                        me.Timezones["_"+data[i].TIMEZONE_PK] = {
                            TimezoneId : data[i].TIMEZONE_PK,
                            TimezoneName : data[i].TIMEZONE_TZ,
                            TimezoneRegionCode : data[i].TIMEZONE_CC
                        };
                    }
                    
                    me.bTimezonesLoaded = true;
                    fnSuccess();
                } catch (e) {

                    jQuery.sap.log.error("Error gathering Timezones: "+JSON.stringify(e.message));
                    me.bTimezonesLoaded = false;
                    fnFail();
                    
                }
            },

            onFail : function (response) {
                jQuery.sap.log.error("Error loading timezone OData: "+JSON.stringify(response));
                me.bTimezonesLoaded = false;
                fnFail();
            }
        });
    },
    
    /**
     * Loads all the room type options into memory.
     */
    LoadRoomTypes : function (mSettings) {
        var me = this;
        var fnSuccess;
        var fnFail;
        
        //--------------------------------------------------------------------//
        // Check the settings map for the two callback functions.
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //-- Success callback --//
            if (mSettings.onSuccess === undefined) {
                fnSuccess = function () {};
            } else {
                fnSuccess = mSettings.onSuccess;
            }
            
            //-- Failure callback --//
            if (mSettings.onFail === undefined) {
                fnFail = function () {};
            } else {
                fnFail = mSettings.onFail;
            }
        } else {
            fnSuccess   = function () {};
            fnFail      = function () {};
        }
        
        //--------------------------------------------------------------------//
        // Call the OData that returns a list of room types.
        //--------------------------------------------------------------------//
        IomyRe.apiodata.AjaxRequest({
            Url : IomyRe.apiodata.ODataLocation("room_types"),
            Columns : ["ROOMTYPE_PK", "ROOMTYPE_NAME", "ROOMTYPE_OUTDOORS"],
            WhereClause : [],
            OrderByClause : [],

            onSuccess : function (responseType, data) {
                try {
                    //--------------------------------------------------------//
                    // Refresh the variable and reload the room type array.
                    //--------------------------------------------------------//
                    me.RoomTypes = {};
                    
                    for (var i = 0; i < data.length; i++) {
                        me.RoomTypes["_"+data[i].ROOMTYPE_PK] = {
                            RoomTypeId : parseInt(data[i].ROOMTYPE_PK),
                            RoomTypeName : data[i].ROOMTYPE_NAME,
                            RoomTypeOutdoors : parseInt(data[i].ROOMTYPE_OUTDOORS)
                        };
                    }
                    
                    me.bRoomTypesLoaded = true;
                    
                    // Call the success callback function
                    fnSuccess();
                } catch (eLoadVariableError) {

                    jQuery.sap.log.error("Error gathering room types: "+JSON.stringify(eLoadVariableError.message));
                    me.bRoomTypesLoaded = false;
                    
                    // Call the failure callback function
                    fnFail();
                }
            },

            onFail : function (response) {
                jQuery.sap.log.error("Error loading room types OData: "+JSON.stringify(response));
                me.bRoomTypesLoaded = false;
                
                // Call the failure callback function
                fnFail();
            }
        });
    },
    
    /**
     * Loads all the premise occupant count options into memory.
     */
    LoadPremiseOccupantsOptions : function (mSettings) {
        var me = this;
        var fnSuccess;
        var fnFail;
        
        //--------------------------------------------------------------------//
        // Check the settings map for the two callback functions.
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //-- Success callback --//
            if (mSettings.onSuccess === undefined) {
                fnSuccess = function () {};
            } else {
                fnSuccess = mSettings.onSuccess;
            }
            
            //-- Failure callback --//
            if (mSettings.onFail === undefined) {
                fnFail = function () {};
            } else {
                fnFail = mSettings.onFail;
            }
        } else {
            fnSuccess   = function () {};
            fnFail      = function () {};
        }
        
        //--------------------------------------------------------------------//
        // Call the OData that returns a list of options for the number of
        // occupants in a premise.
        //--------------------------------------------------------------------//
        IomyRe.apiodata.AjaxRequest({
            Url : IomyRe.apiodata.ODataLocation("premise_occupants"),
            Columns : ["PREMISEOCCUPANTS_PK", "PREMISEOCCUPANTS_NAME"],
            WhereClause : [],
            OrderByClause : [],

            onSuccess : function (responseType, data) {
                try {
                    me.PremiseOccupantsOptions = {};
                    
                    for (var i = 0; i < data.length; i++) {
                        me.PremiseOccupantsOptions["_"+data[i].PREMISEOCCUPANTS_PK] = {
                            OccupantCount   : data[i].PREMISEOCCUPANTS_NAME,
                            OccupantCountId : data[i].PREMISEOCCUPANTS_PK
                        };
                    }

                    me.bPremiseOccupantsOptionsLoaded = true;
                    
                    // Call the success callback function
                    fnSuccess();
                } catch (eLoadVariableError) {
                    jQuery.sap.log.error("Error gathering premise occupant counts: "+JSON.stringify(eLoadVariableError.message));
                    me.bPremiseOccupantsOptionsLoaded = false;
                    
                    // Call the failure callback function
                    fnFail();
                }
            },

            onFail : function (response) {
                jQuery.sap.log.error("Error loading premise occupant count OData: "+JSON.stringify(response));
                me.bPremiseOccupantsOptionsLoaded = false;
                
                // Call the failure callback function
                fnFail();
            }
        });
        
    },
    
    /**
     * Loads all the premise room count options into memory.
     */
    LoadPremiseRoomsOptions : function (mSettings) {
        var me = this;
        var fnSuccess;
        var fnFail;
        
        //--------------------------------------------------------------------//
        // Check the settings map for the two callback functions.
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //-- Success callback --//
            if (mSettings.onSuccess === undefined) {
                fnSuccess = function () {};
            } else {
                fnSuccess = mSettings.onSuccess;
            }
            
            //-- Failure callback --//
            if (mSettings.onFail === undefined) {
                fnFail = function () {};
            } else {
                fnFail = mSettings.onFail;
            }
        } else {
            fnSuccess   = function () {};
            fnFail      = function () {};
        }
        
        //--------------------------------------------------------------------//
        // Call the OData that returns a list of options for the number of rooms
        // in a premise.
        //--------------------------------------------------------------------//
        IomyRe.apiodata.AjaxRequest({
            Url : IomyRe.apiodata.ODataLocation("premise_rooms"),
            Columns : ["PREMISEROOMS_PK", "PREMISEROOMS_NAME"],
            WhereClause : [],
            OrderByClause : [],

            onSuccess : function (responseType, data) {
                try {
                    me.PremiseRoomsOptions = {};
                    
                    for (var i = 0; i < data.length; i++) {
                        me.PremiseRoomsOptions["_"+data[i].PREMISEROOMS_PK] = {
                            RoomCount   : data[i].PREMISEROOMS_NAME,
                            RoomCountId : data[i].PREMISEROOMS_PK
                        };
                    }

                    me.bPremiseRoomsOptionsLoaded = true;
                    
                    // Call the success callback function
                    fnSuccess();
                } catch (eLoadVariableError) {
                    jQuery.sap.log.error("Error gathering premise room counts: "+JSON.stringify(eLoadVariableError.message));
                    
                    // Call the failure callback function
                    fnFail();
                }
            },

            onFail : function (response) {
                jQuery.sap.log.error("Error loading premise room count OData: "+JSON.stringify(response));
                me.bPremiseRoomsOptionsLoaded = false;
                
                // Call the failure callback function
                fnFail();
            }
        });
        
    },
    
    /**
     * Loads all the premise floor count options into memory.
     */
    LoadPremiseFloorsOptions : function (mSettings) {
        var me = this;
        var fnSuccess;
        var fnFail;
        
        //--------------------------------------------------------------------//
        // Check the settings map for the two callback functions.
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //-- Success callback --//
            if (mSettings.onSuccess === undefined) {
                fnSuccess = function () {};
            } else {
                fnSuccess = mSettings.onSuccess;
            }
            
            //-- Failure callback --//
            if (mSettings.onFail === undefined) {
                fnFail = function () {};
            } else {
                fnFail = mSettings.onFail;
            }
        } else {
            fnSuccess   = function () {};
            fnFail      = function () {};
        }
        
        //--------------------------------------------------------------------//
        // Call the OData that returns a list of options for the number of
        // floors in a premise.
        //--------------------------------------------------------------------//
        IomyRe.apiodata.AjaxRequest({
            Url : IomyRe.apiodata.ODataLocation("premise_floors"),
            Columns : ["PREMISEFLOORS_PK", "PREMISEFLOORS_NAME"],
            WhereClause : [],
            OrderByClause : [],

            onSuccess : function (responseType, data) {
                try {
                    me.PremiseFloorsOptions = {};
                    
                    for (var i = 0; i < data.length; i++) {
                        me.PremiseFloorsOptions["_"+data[i].PREMISEFLOORS_PK] = {
                            FloorCount   : data[i].PREMISEFLOORS_NAME,
                            FloorCountId : data[i].PREMISEFLOORS_PK
                        };
                    }

                    me.bPremiseFloorsOptionsLoaded = true;
                    
                    // Call the success callback function
                    fnSuccess();
                } catch (eLoadVariableError) {
                    jQuery.sap.log.error("Error gathering premise floor count: "+JSON.stringify(eLoadVariableError.message));
                    me.bPremiseFloorsOptionsLoaded = false;
                    
                    // Call the failure callback function
                    fnFail();
                }
            },

            onFail : function (response) {
                jQuery.sap.log.error("Error loading premise floor count OData: "+JSON.stringify(response));
                me.bPremiseFloorsOptionsLoaded = false;
                
                // Call the failure callback function
                fnFail();
            }
        });
        
    },
    
    /**
     * Loads all the premise floor count options into memory.
     */
    LoadPremiseBedroomsOptions : function (mSettings) {
        var me = this;
        var fnSuccess;
        var fnFail;
        
        //--------------------------------------------------------------------//
        // Check the settings map for the two callback functions.
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //-- Success callback --//
            if (mSettings.onSuccess === undefined) {
                fnSuccess = function () {};
            } else {
                fnSuccess = mSettings.onSuccess;
            }
            
            //-- Failure callback --//
            if (mSettings.onFail === undefined) {
                fnFail = function () {};
            } else {
                fnFail = mSettings.onFail;
            }
        } else {
            fnSuccess   = function () {};
            fnFail      = function () {};
        }
        
        //--------------------------------------------------------------------//
        // Call the OData that returns a list of options for the number of
        // floors in a premise.
        //--------------------------------------------------------------------//
        IomyRe.apiodata.AjaxRequest({
            Url : IomyRe.apiodata.ODataLocation("premise_bedrooms"),
            Columns : ["PREMISEBEDROOMS_PK", "PREMISEBEDROOMS_COUNT"],
            WhereClause : [],
            OrderByClause : [],

            onSuccess : function (responseType, data) {
                try {
                    me.PremiseBedroomsOptions = {};
                    
                    for (var i = 0; i < data.length; i++) {
                        me.PremiseBedroomsOptions["_"+data[i].PREMISEBEDROOMS_PK] = {
                            BedroomCount   : data[i].PREMISEBEDROOMS_COUNT,
                            BedroomCountId : data[i].PREMISEBEDROOMS_PK
                        };
                    }

                    me.bPremiseBedroomsOptionsLoaded = true;
                    
                    // Call the success callback function
                    fnSuccess();
                } catch (eLoadVariableError) {
                    jQuery.sap.log.error("Error gathering premise bedroom count: "+JSON.stringify(eLoadVariableError.message));
                    me.bPremiseBedroomsOptionsLoaded = false;
                    
                    // Call the failure callback function
                    fnFail();
                }
            },

            onFail : function (response) {
                jQuery.sap.log.error("Error loading premise floor count OData: "+JSON.stringify(response));
                me.bPremiseBedroomsOptionsLoaded = false;
                
                // Call the failure callback function
                fnFail();
            }
        });
        
    },
    
    //================================================================//
    //== Retrieve all Link Types                                    ==//
    //================================================================//
    RetrieveLinkTypeList : function(oConfig) {
        var me = this;
        
        IomyRe.apiodata.AjaxRequest({
            Url : IomyRe.apiodata.ODataLocation("link_types"),
            Columns : [
                "LINKTYPE_PK","LINKTYPE_NAME"
            ],
            WhereClause : [],
            OrderByClause : ["LINKTYPE_PK asc"],
            
            onSuccess : function (responseType, data) {
                me.LinkTypeList = {};
                
                for (var i = 0; i < data.length; i++) {
                    me.LinkTypeList["_"+data[i].LINKTYPE_PK] = {
                        "LinkTypeId" : data[i].LINKTYPE_PK,
                        "LinkTypeName" : data[i].LINKTYPE_NAME,
                    };
                }
                
                me.bLinkTypesLoaded = true;
                
                //-- Perform the "onSuccess" function if applicable --//
                if(oConfig.onSuccess !== undefined) {
                    oConfig.onSuccess();
                }
            },
            
            onFail : function (response) {
                jQuery.sap.log.error("Error refreshing link type list: "+JSON.stringify(response));
                
                //-- Perform the "onFail" function if applicable --//
                if(oConfig.onFail) {
                    oConfig.onFail();
                }
            }
        });
    },
    
    WipeCoreVariables : function () {
        this.CommList       = {};
        this.LinkList       = {};
        this.ThingList      = {};
        this.HubList        = {};
        this.PremiseList    = {};
        this.RoomList       = {};
        this.UserInfo       = {};
        
        this.RoomAdminRoomsList = {};
        this.UserList           = {};
    },
    
    LookupPremisePermissionFromId: function( iPremiseId ) {
		if( iPremiseId>=1 ) {
			var sPremiseCode = "_"+iPremiseId;
			var aPremise     = IomyRe.common.PremiseList[sPremiseCode];
			
			var iPremiseWrite         = aPremise.PermWrite;
            var iPremiseOwner         = aPremise.PermOwner;
            var iPremiseRoomAdmin     = aPremise.PermRoomAdmin;
            var sPermissionText       = "";
            
            if (iPremiseOwner === 1) {
                sPermissionText = "Premise Owner";   
            } else if (iPremiseRoomAdmin === 1) {
                 sPermissionText = "Room Admin Access";
            } else if (iPremiseWrite === 1) {
                 sPermissionText = "Write Access";
            } else {
                 sPermissionText = "Read Only Access";
            }
            
			return sPermissionText;
		} else {
			return false;
		}
	},
    
    LookupRoomPermissionFromId: function( iRoomId ) {
		if( iRoomId>=1 ) {
			var sRoomCode = "_"+iRoomId;
			var aRoom     = IomyRe.common.AllRoomsList[sRoomCode];
			
			var iRoomRead              = aRoom.PermDeviceRead;             
            var iRoomWrite             = aRoom.PermWrite;            
            var iRoomStateToggle       = aRoom.PermStateToggle;
            var sPermissionText        = "";
            
            if (iRoomRead === 0) {          
                sPermissionText = "No Access";            
            } else {
                if(iRoomWrite === 1) {   
                    sPermissionText = "Full Access";  
                } else if (iRoomStateToggle === 1) { 
                    sPermissionText = "Read / State Toggle";
                } else {
                    sPermissionText = "Read Only Access";
                }
            }
            
			return sPermissionText;
		} else {
			return false;
		}
	},
    
    LookupRegionNameFromRegionId: function( iRegionId ) {
		if( iRegionId>=1 ) {
			var sRegionCode = "_"+iRegionId;
			var aRegion     = IomyRe.common.Regions[sRegionCode];
			
			var sRegionName     = aRegion.RegionName;
			return sRegionName;
		} else {
			return false;
		}
	},
    
    LookupTimezoneNameFromTimezoneId: function( iTimezoneId ) {
		if( iTimezoneId>=1 ) {
			var sTimezoneCode = "_"+iTimezoneId;
			var aTimezone     = IomyRe.common.Timezones[sTimezoneCode];
			
			var sTimezoneName     = aTimezone.TimezoneName;
			return sTimezoneName;
		} else {
			return false;
		}
	},
    
    LookupLanguageNameFromLanguageId: function( iLanguageId ) {
		if( iLanguageId>=1 ) {
			var sLanguageCode = "_"+iLanguageId;
			var aLanguage     = IomyRe.common.Languages[sLanguageCode];
			
			var sLanguageName     = aLanguage.LanguageName;
			return sLanguageName;
		} else {
			return false;
		}
	},
	
	
	//================================================================//
	//== Lookup and Format Permissions functions                    ==//
	//================================================================//
	LookupPremPermLevelName: function ( iPermLevel ) {
		var sKey = "_"+iPermLevel;
		
		if( typeof IomyRe.common.PermLevelsPremise[sKey]!=="undefined" ) {
			return IomyRe.common.PermLevelsPremise[sKey].Name;
		} else {
			return "Error has occurred!";
		}
	},
	
	LookupPremPermLevelEditable: function ( iPermLevel ) {
		if( iPermLevel>=4 ) {
			return false;
		} else {
			return true;
		}
	},
	
	LookupPremisePermLevelFromPermissions: function ( mPremise ) {
		if( mPremise.PremiseId>=1 ) {
			var iPremPermLevel = 0;
			
			var iPremiseRead          = mPremise.PermRead;
			var iPremiseWrite         = mPremise.PermWrite;
			var iPremiseOwner         = mPremise.PermOwner;
			var iPremiseRoomAdmin     = mPremise.PermRoomAdmin;
			
			//------------------------------------//
			//-- Premise Adminstrator Access    --//
			//------------------------------------//
			if ( iPremiseOwner===1 ) {
				if( iPremiseRead===1 ) {
					//-- Premise Administrator with Premise Visible --//
					iPremPermLevel = 5;
				} else {
					//-- Premise Administrator with Premise Hidden --//
					iPremPermLevel = 4;
				}
				
			//------------------------------------//
			//-- Regular User Access            --//
			//------------------------------------//
			} else  {
				if ( iPremiseRoomAdmin===1 ) {
					//-- Premise Room Manager --//
					iPremPermLevel = 3;
				} else if ( iPremiseWrite===1 ) {
					//-- Premise Read and Write access --//
					iPremPermLevel = 2;
				} else if ( iPremiseRead===1 ) {
					//-- Premise Read access --//
					iPremPermLevel = 1;
				} else {
					//-- No Access --//
					iPremPermLevel = 0;
				}
			}
			
			return iPremPermLevel;
			
		} else {
			return 0;
		}
		
	},
	
	LookupRoomPermLevelName: function ( iPermLevel ) {
		var sKey = "_"+iPermLevel;
		
		if( typeof IomyRe.common.PermLevelsRoom[sKey]!=="undefined" ) {
			return IomyRe.common.PermLevelsRoom[sKey].Name;
		} else {
			return "Error has occurred!";
		}
	},
	
	LookupRoomPermLevelFromPermissions: function ( mRoom ) {
		if( mRoom.RoomId>=1 ) {
			var iRoomPermLevel = 0;
			
			var iRoomRead             = mRoom.PermRead;
			var iRoomWrite            = mRoom.PermWrite;
			var iRoomStateToggle      = mRoom.PermStateToggle;
			
			//------------------------------------//
			//-- Premise Adminstrator Access    --//
			//------------------------------------//
			if ( iRoomWrite===1 ) {
				//-- Premise Room Manager --//
				iRoomPermLevel = 3;
			} else if ( iRoomStateToggle===1 ) {
				//-- Premise Read and Write access --//
				iRoomPermLevel = 2;
			} else if ( iRoomRead===1 ) {
				//-- Premise Read access --//
				iRoomPermLevel = 1;
			} else {
				//-- No Access --//
				iRoomPermLevel = 0;
			}
			
			return iRoomPermLevel;
			
		} else {
			return 0;
		}
	},
    
    /**
     * Returns the ID of the first premise found to be able to communicate
     * using telnet. If 0 is return, either no such premise was found, or an
     * error occurred, in which case, an error message will appear in the log.
     * 
     * @returns {Number}    
     */
    LookupFirstHubToUseWithTelnet : function () {
        var iPremiseId = 0;
        
        try {
            $.each(IomyRe.common.HubList, function (sI, mHub) {
                
                if (mHub.PermTelnet === 1) {
                    iPremiseId = mHub.PremiseId;
                    return false;
                }
                
            });
        } catch (e) {
            iPremiseId = 0;
            $.sap.log.error("Error searching for the first hub for telnet communication ("+e.name+"): " + e.message);
            
        } finally {
            return iPremiseId;
        }
    },
	
    //============================================//
    //== NAVIGATION FUNCTIONS                    ==//
    //============================================//
    /**
     * This stores the page ID that is used to define the default page, or the
     * home or start page.
     */
    sNavigationDefaultPage: "pBlock", 
    
    //----------------------------------------------------------------------------------------//
    //-- This function is used to change pages on the website and track what pages have        --//
    //-- led from the "Navigation Main" page to this current page                            --//
    //----------------------------------------------------------------------------------------//
    /**
     * This function is used to change pages on the app and track what pages have
     * led from the "Navigation Main" page to this current page.
     * 
     * @param {string} sPageName            ID of the page, aka a UI5 View, to change to.
     * @param {object} aPageData            (optional) Associative array of any data to parse to the page.
     * @param {boolean} bResetNavArray      (optional) Boolean flag declaring that a reset is required (default = false)
     */
    NavigationChangePage: function( sPageName, aPageData, bResetNavArray ) {
        var bCreatingPage   = true;
        var aErrorMessages  = [];

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
            //    IomyRe.common.NavPagesCurrentIndex = 0;
            //}
            
            if( IomyRe.common.NavPagesNavigationArray.length >= IomyRe.common.NavPagesCurrentIndex ) {
                //-- If there is more Pages stored in the forward side of the array then the array can have those forward pages removed --//
                var iIteration            = this.NavPagesCurrentIndex;
                var iMaxIterations        = this.NavPagesNavigationArray.length;
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
        
        //------------------------------------------------------------------------//
        // We need to check that the permissons are correct for a user to access
        // certain pages.
        //------------------------------------------------------------------------//
        try {
            //-- User List --//
            if (sPageName === "pUserList" || sPageName === "pUserForm" || sPageName === "pNewUser") {
                if (IomyRe.common.UserInfo.PermUserAdmin != 1) {
                    aErrorMessages.push("You don't have sufficient privileges to manage users.");
                }
                
            //-- Rules List --//
            } else if (sPageName === "pRulesList" || sPageName === "pRulesForm") {
                if (IomyRe.common.LookupFirstHubToUseWithTelnet() == 0) {
                    aErrorMessages.push("Only the owner of a premise can manage rules.");
                }
                
            //-- Telnet Console --//
            } else if (sPageName === "pTelnet") {
                if (IomyRe.common.LookupFirstHubToUseWithTelnet() == 0) {
                    aErrorMessages.push("Only the owner of a premise can use the telnet console.");
                }
            }
            
            if (aErrorMessages.length > 0) {
                bCreatingPage = false;
            }
        } catch (e) {
            $.sap.log.error("There was an error checking the page permissions ("+e.name+"): " + e.message);
        }
        
        //------------------------------------------------------------------------//
        // Attempt to create (if it hasn't been so already) and switch to the page.
        //------------------------------------------------------------------------//
        try {
            if (bCreatingPage) {
                if (oApp.getPage(sPageName) === null) {
                    IomyRe.pages.createPage(sPageName);
                } else {
                    if (oApp.getPage(sPageName).byId("openMenu") !== undefined) {
                        var sDisplayName = IomyRe.common.UserInfo.Displayname || IomyRe.common.UserInfo.Username;
                        oApp.getPage(sPageName).byId("openMenu").setText("Hi, "+sDisplayName);
                    }

                    IomyRe.help.addHelpMessage(sPageName);
                }

                //--------------------------------------------------------------------//
                // If the side menu was open when this function is called, close it.
                //--------------------------------------------------------------------//
        //        console.log(sap.ui.Device.system.desktop);
        //        console.log(sap.ui.Device.system.phone);
        //        console.log(sap.ui.Device.system.tablet);
                if (oApp.getCurrentPage().byId("toolPage") !== undefined) {
                    if (oApp.getCurrentPage().byId("toolPage").getSideExpanded() === true &&
                        sap.ui.Device.system.phone) 
                    {
                        IomyRe.navigation.onSideNavButtonPress(null, oApp.getCurrentPage());

                    } else if (oApp.getCurrentPage().byId("toolPage").getSideExpanded() === false &&
                        sap.ui.Device.system.desktop && oApp.getCurrentPage().getId() !== sPageName )
                    {
                        IomyRe.navigation.onSideNavButtonPress(null, oApp.getCurrentPage());
                    }
                }

                //-- Navigate to the new Page --//
                oApp.to( sPageName, aPageData );
            } else {
                //----------------------------------------------------------------//
                // There were conditions that were not met for a particular page.
                // Show an error popup.
                //----------------------------------------------------------------//
                IomyRe.common.showError(aErrorMessages.join("\n\n"), "Cannot access page");
            }
        } catch (e) {
            $.sap.log.error("There was an error creating and switching the page ("+e.name+"): " + e.message);
        }
        
    },
    
    //----------------------------------------------------------------------------------------//
    //-- This function is used to change pages either back or forward ( depending on what    --//
    //-- the user has clicked )                                                                --//
    //----------------------------------------------------------------------------------------//
    NavigationTriggerBackForward: function( bForwardTriggered ) {
        //-- Restart the status of the extras menu      --//
        IomyRe.widgets.extrasMenuOpen = false;
        
        // Declare variables
        var sName        = "";
        var aData        = {};
        
        //-- IF the app requested to go forward a page --//
        if( bForwardTriggered===true ) {
            if( IomyRe.common.NavPagesNavigationArray.length > (IomyRe.common.NavPagesCurrentIndex+1) ) {
                //-- Increase the Current Index back to the next value --//
                //jQuery.sap.log.debug("NavForward CurrentLength="+IomyRe.common.NavPagesNavigationArray.length);
                //jQuery.sap.log.debug("NavForward CurrentIndex="+IomyRe.common.NavPagesCurrentIndex);
                IomyRe.common.NavPagesCurrentIndex++;
                //jQuery.sap.log.debug("NavForward NewIndex="+IomyRe.common.NavPagesCurrentIndex);
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
                oApp.to( IomyRe.common.sNavigationDefaultPage, "slide", {} );
                
            } else {
                //-- Decrease the Current Index back to the previous value --//
                //jQuery.sap.log.debug("NavBack CurrentIndex="+IomyRe.common.NavPagesCurrentIndex);
                IomyRe.common.NavPagesCurrentIndex--;
                //jQuery.sap.log.debug("NavBack NewIndex="+IomyRe.common.NavPagesCurrentIndex);
                
                sName = IomyRe.common.NavPagesNavigationArray[IomyRe.common.NavPagesCurrentIndex].Name;
                aData = IomyRe.common.NavPagesNavigationArray[IomyRe.common.NavPagesCurrentIndex].Data;
                
                //jQuery.sap.log.debug("NavBack NavArray="+JSON.stringify(IomyRe.common.NavPagesNavigationArray) );
                //jQuery.sap.log.debug("NavBack BackPage="+JSON.stringify(IomyRe.common.NavPagesNavigationArray[IomyRe.common.NavPagesCurrentIndex]) );
                //-- Navigate back to the previous Page --//
                oApp.to( sName, "slide", aData );
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
        oApp.to( IomyRe.common.sNavigationDefaultPage, "slide", {} );
        
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
            switch(sTargetType) {
                case "FormContainer":
                    //console.log("Add FormContainer");
                    oTarget.destroyFormContainers();
                    oTarget.addFormContainer( IomyRe.common.GetFormFragment( oController, sFragmentName) );
                break;
                //case "FormElement":
                //    //console.log("Add FormElement");
                //    oTarget.destroyFormElements();
                //    oTarget.addFormElement( IomyRe.common.GetFormFragment( oController, sFragmentName) );
                //break;
                case "Item":
                    //console.log("Add Item");
                    oTarget.destroyItems();
                    oTarget.addItem( IomyRe.common.GetFormFragment( oController, sFragmentName) );
                break;
                case "Block":
                    //console.log("Add Block");
                    oTarget.destroyBlocks();
                    oTarget.addBlock( IomyRe.common.GetFormFragment( oController, sFragmentName) );
                break;
                default: 
                    //console.log("Add Content");
                    oTarget.removeAllContent();
                    oTarget.addContent( IomyRe.common.GetFormFragment( oController, sFragmentName) );
                break;
            }
            return oTarget;
        //-- TODO: Replace this with a better error message --//
        } catch(e1) {
            $.sap.log.error("ShowFormFragment: Critical Error "+e1.message);
            return false;
        }
        
    } 
});