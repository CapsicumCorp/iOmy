/*
Title: Common functions and variables Module
Authors: 
    Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
    Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Module for creating and holding global variables for our lists in iOmy,
    dialog boxes, flags, navigation, settings, etc. Things that are commonly used in
    iOmy.
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

$.sap.require("sap.m.MessageBox");
$.sap.declare("IOMy.common",true);

IOMy.common = new sap.ui.base.Object();

$.extend(IOMy.common,{
	
	
	//============================================//
	//== Initialisation Variable				==//
	//============================================//
	//-- Variables that are used to declare if	--//
	//-- a login has been successful or not		--//
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
	//== USER VARIABLES							==//
	//============================================//
	//-- Arrays used to store the User's variables
	//--------------------------------------------//
    CurrentUsername         : null,
	UserId					: 0,
	UserDisplayName			: null,
    
	UserVars : {},			//-- TODO: Check if this variable is still used anywhere --//
	
	UserInfo:               {},
	UserInfoLastUpdate:     new Date(),
	
	UserAppVariables: {
		"PagePerms": {
			"SettingsThingList":	false,		//-- BOOLEAN:	Flags if the User is allowed to access the "SettingsThingList" Page.		--//
			"SettingsPremiseList":	false,		//-- BOOLEAN:	Flags if the User is allowed to access the "SettingsPremiseList" Page.		--//
		}
	},
	
    //============================================//
	//== LOCALE OPTIONS         				==//
	//============================================//
    bRegionsLoaded        : false,
    bLanguagesLoaded        : false,
    bStatesProvincesLoaded  : false,
    bPostCodesLoaded        : false,
    bTimezonesLoaded        : false,
    
    Regions               : [],
    Languages               : [],
    StatesProvinces         : [],
    PostCodes               : [],
    Timezones               : [],
    
	//============================================//
	//== PREMISE AND GATEWAY LIST				==//
	//============================================//
	//-- An Array used to store the 
	//--------------------------------------------//
	PremiseList:					[],
	HubList:					[],
	PremiseListLastUpdate:			new Date(),
	HubListLastUpdate:			new Date(),
	PremiseSelected:				[],
	
	RoomsList:						{},
	RoomsListLastUpdate:			new Date(),
	
	//============================================//
	//== DEVICE LIST							==//
	//============================================//
	//-- An Array used to store the Thing List  --//
	//--------------------------------------------//
    LinkList                        : [],
    LinkListLastUpdate:   			new Date(),
    LinkTypeList                    : [],
	ThingList						: {},
    ThingListLastUpdate:			new Date(),
	RSCategoriesList				: [],
	RSCatToolbar					: [],
	IconList						: [],

	//============================================//
	//== Navigational Variables					==//
	//============================================//
	NavPagesNavigationArray			: [],			//-- ARRAY:			This array holds the list of Pages (and Parameters).	--//
	NavPagesCurrentIndex			: -1,			//-- INTEGER:		This is the index of what page the User is on. NOTE: 0 indicates that the user is on the "Navigation Main" Page (or "Login" Page)	--//
	
    //============================================//
	//== Boolean flags      					==//
	//============================================//
    bItemNameChangedMustRefresh     : false,        //-- BOOLEAN:       Indicates whether to refresh certain pages after changing the name of an item   --//
    bSessionTerminated              : false,        //-- BOOLEAN:       Indicates whether the session was terminated for whatever reason. Sets to true when an API request (OData or PHP) encounters a HTTP 403 error.   --//
    
	//============================================//
	//== CONFIGURATION VARIABLES				==//
	//============================================//
	//--
	//--------------------------------------------//
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
				sReturn = '/ui/mobile';
				break;
		}
		
		return sReturn;
	},
	
	
	CheckSessionInfo : function(aConfig) {
		//-- Declare scope as a variable --//
		var me = this;
		
		
		$.ajax({
			url: IOMy.apiphp.APILocation("sessioncheck"),
			type: "POST",
			//================================================//
			//== ON SUCCESS
			//================================================//
			success: function(response) {
				//================================================//
				//== Initialise variables						==//
				//================================================//
				var sErrMesg = "";		//-- STRING: Used to store an error message should an error occur --//
				
				//================================================//
				//== 2.A - User is currently logged in			==//
				//================================================//
				if (response.login===true) {
					aConfig.OnUserSessionActive(response);
					
				//================================================//
				//== 2.B - User is not logged in				==//
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
				sErrMesg += "1.) Database Problem: \tThe IOMy Database may have stopped running! Please check with whoever manages your system. \n";
				sErrMesg += "2.) IOMY Version Upgrade: \tThe Person that manages your IOMy system may be rolling out a new update. \n";
				IOMy.common.showError(sErrMesg, "Authentication Error",
                    function () {
                        // Refresh the page to redirect to the login page.
                        window.location.reload(true);
                    }
                );
				
			}
		});
	},
	
	//============================================//
	//== PERIODIC VARIABLES AND FUNCTIONS		==//
	//============================================//
	//-- 
	//--------------------------------------------//
	CurrentPeriod: "Day",
	
	GetStartOfCurrentPeriod: function() {
		var me				= this;					//-- SCOPE:				--//
		var dCurrentDate	= new Date();			
		var dDesiredDate	= new Date();			
			
		
		//-- TODO: Add the other Periods and use the User's or the Premise's Timezone --//
		if(this.CurrentPeriod==="Day") {
			dDesiredDate.setHours(0, 0, 0, 0);
		} else if (this.CurrentPeriod==="Month") {
			
			dDesiredDate = new Date(dCurrentDate.getFullYear(), dCurrentDate.getMonth(), 1);
			
		} else {
			dDesiredDate = 2000;
		}
		
		var iReturn = parseInt( dDesiredDate/1000, 10 );
		
		return iReturn;
	},
	
	GetEndOfCurrentPeriod: function() {
		//-- TODO: Have it so the Current Period doesn't have to end with now as the current time --//
		var iReturn		= 0;
		var dDate		= new Date();
		
		
		iReturn = parseInt( dDate/1000, 10 );
		return iReturn;
	},
	
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
	showMessage : function( sMessage, sTitle, fnCallback, sCssClass ){
		//-- --//
		var callbackFn = fnCallback || function(){};
		var cssClass = sCssClass || "";
		
		// open a fully configured message box
		sap.m.MessageBox.show(
			sMessage,
			{
				icon: sap.m.MessageBox.Icon.INFORMATION,
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
	showSuccess : function( sMessage, sTitle, fnCallback, sCssClass ){
		//-- --//
		var callbackFn = fnCallback || function(){};
		var cssClass = sCssClass || "";
		
		// open a fully configured message toast
		sap.m.MessageToast.show(
			sMessage,
			{
				actions: sap.m.MessageBox.Action.CLOSE
				//styleClass : cssClass
			}
		);
		// TODO: This is a temporary measure to allow the function to be called after the toast is shown.
		// TODO: Go through each form and move the function code out and place it in the parent function.
		callbackFn();
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
	
	// Confirm Question for Sign Out
	showConfirmQuestion : function( sMessage, sTitle, fnCallback, sCssClass ){
		//-- Defaults --//
		var callbackFn = fnCallback || function(){};
		var cssClass = sCssClass || "iOmySignout";
		
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
	showLoading : function(bShow, sMsg, iDelay){
		if(bShow) {
			sap.ui.core.BusyIndicator.show( iDelay || 0 );
			$('#sapUiBusyIndicator').empty();
			$('#sapUiBusyIndicator').append([
				'<div class="custom-loading-indicator">', 
				'<div class="custom-loading-icon"></div>',
				'<div class="loading-text">' + (sMsg || 'Loading...') + '</div>' ,
				'</div>'
            ].join(''));
		} else {
			sap.ui.core.BusyIndicator.hide();
		}
	},
	
	createLoadingStatusObj : function( statusObj, comp ){
		statusObj[comp] = {
			isComplete : false,
			msg : ''
		};
	},
	

	//================================================//
	//== Check whether all request are complete		==//
	//================================================//
	checkLoadCompletion : function(loadObj){
		//-- TODO: Check if this is still referenced --//
		var loadStatuses=[];
		var errorMessage = '';
		$.each(loadObj,function(key,item){
			loadStatuses.push(item.isComplete);
			errorMessage += (item.msg) ? '\n' + item.msg : ''; 
		});
		if(loadStatuses.indexOf(false) == -1){
			IOMy.common.showLoading(false);

			if(errorMessage){
				jQuery.sap.log.error("Error:Request error:"+errorMessage);
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
        
        IOMy.apiodata.AjaxRequest({
            Url : IOMy.apiodata.ODataLocation("regions"),
            Columns : ["REGION_NAME", "REGION_PK", "REGION_ABREVIATION"],
            WhereClause : [],
            OrderByClause : ["REGION_NAME asc"],

            onSuccess : function (responseType, data) {
                try {
                    me.Regions = [];
                    
                    for (var i = 0; i < data.length; i++) {
                        me.Regions.push({
                            RegionId            : data[i].REGION_PK,
                            RegionName          : data[i].REGION_NAME,
                            RegionAbbreviation  : data[i].REGION_ABREVIATION
                        });
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
        
        IOMy.apiodata.AjaxRequest({
            Url : IOMy.apiodata.ODataLocation("language"),
            Columns : ["LANGUAGE_PK","LANGUAGE_NAME"],
            WhereClause : [],
            OrderByClause : ["LANGUAGE_NAME asc"],

            onSuccess : function (responseType, data) {
                try {
                    me.Languages = [];
                    
                    for (var i = 0; i < data.length; i++) {
                        me.Languages.push({
                            LanguageId : data[i].LANGUAGE_PK,
                            LanguageName : data[i].LANGUAGE_NAME
                        });
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
        
        IOMy.apiodata.AjaxRequest({
            Url : IOMy.apiodata.ODataLocation("timezones"),
            Columns : ["TIMEZONE_PK","TIMEZONE_TZ"],
            WhereClause : [],
            OrderByClause : ["TIMEZONE_TZ asc"],

            onSuccess : function (responseType, data) {
                try {
                    me.Timezones = [];
                    
                    for (var i = 0; i < data.length; i++) {
                        me.Timezones.push({
                            TimezoneId : data[i].TIMEZONE_PK,
                            TimezoneName : data[i].TIMEZONE_TZ
                        });
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
    
    //================================================================//
	//== Retrieve Link Information									==//
	//================================================================//
	RetrieveLinkList : function (oConfig) {
        var me = this;
        
        IOMy.apiodata.AjaxRequest({
			Url : IOMy.apiodata.ODataLocation("link"),
			Columns : [
                "ROOMS_PREMISE_FK","LINK_PK","LINK_SERIALCODE","LINK_NAME","LINK_CONNECTED",
                "LINK_STATE","LINKTYPE_PK","LINKTYPE_NAME","ROOMS_PK",
                "LINKCONN_PK","LINKCONN_NAME","LINKCONN_ADDRESS","LINKCONN_USERNAME",
                "LINKCONN_PASSWORD","LINKCONN_PORT","LINK_COMM_FK"
            ],
			WhereClause : [],
			OrderByClause : ["LINK_PK asc"],
			
			onSuccess : function (responseType, data) {
				me.LinkList = [];
                
				for (var i = 0; i < data.length; i++) {
					me.LinkList.push({
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
                        "PremiseId" : data[i].ROOM_PREMISE_FK,
						"CommId" : data[i].LINK_COMM_FK
					});
				}
                
                //--------------------------------------------------------//
                // ONLY add these hard-coded devices if user is 'demo',
                // our debug user.
                //--------------------------------------------------------//
//                if (IOMy.common.CurrentUsername === "demo") {
//                    IOMy.experimental.addDemoDataToLinkList();
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
    
    //================================================================//
	//== Retrieve all Link Types    								==//
	//================================================================//
    RetrieveLinkTypeList : function(oConfig) {
        var me = this;
        
        IOMy.apiodata.AjaxRequest({
			Url : IOMy.apiodata.ODataLocation("link_types"),
			Columns : [
                "LINKTYPE_PK","LINKTYPE_NAME"
            ],
			WhereClause : [],
			OrderByClause : ["LINKTYPE_PK asc"],
			
			onSuccess : function (responseType, data) {
				me.LinkTypeList = [];
				
				for (var i = 0; i < data.length; i++) {
					me.LinkTypeList.push({
						"LinkTypeId" : data[i].LINKTYPE_PK,
						"LinkTypeName" : data[i].LINKTYPE_NAME,
					});
				}
                
                //--------------------------------------------------------//
                // ONLY add these hard-coded devices if user is 'demo'.
                //--------------------------------------------------------//
//                if (IOMy.common.CurrentUsername === "demo") {
//                    IOMy.experimental.addDemoDataToLinkTypeList();
//                }
				
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
    
    //========================================================================//
    // REFRESH CORE VARIABLE FUNCTIONS
    //========================================================================//
    
    /**
     * Starts the procession of procedures that will reloads all the core
     * variables into memory to so that iOmy code can fetch the necessary
     * information without constantly polling the database. These are the
     * variables being refreshed.
     * 
     * 1. Locale Information Lists
     * 2. Premise List
     * 3. Hub List
	 * 4. Comm List
     * 5. Room List
     * 6. Link List
     * 7. Link Type List
     * 8. Thing List
     * 
     * There are eight steps.
     */
    ReloadCoreVariables : function (fnCallback, fnFailCallback) {
        //-- NOTE: This function is DEPRECATED for the time being and just left in as a reference temporarily until we are happy with the new CoreVariables system. --//
        //--     The first 8 API requests were 
        var me = this;
        
        if( me.isCoreVariablesRefreshInProgress(1, fnFailCallback)===false ) {
            IOMy.common.CoreVariableRefreshStepsInProgress[0] = true;
            
            // Load Current Username into memory.
            
            // STEP 1 of 7: Procedures for refreshing lists.
            
            //-- Load the Regions --//
            me.LoadRegions({
                onSuccess : function () {
                    
                    //-- Load the Languages --//
                    me.LoadLanguages({
                        onSuccess : function () {
                            
                            //-- Load the Timezones --//
                            me.LoadTimezones({
                                onSuccess : function () {
                                    
                                    //-- Load the Room Types --//
                                    me.LoadRoomTypes({
                                        onSuccess : function () {
                                            
                                            //-- Load the Premise Bedroom Options --//
                                            me.LoadPremiseBedroomsOptions({
                                                onSuccess : function () {
                                                    
                                                    //-- Load the Premise Occupant Options --//
                                                    me.LoadPremiseOccupantsOptions({
                                                        onSuccess : function () {
                                                            
                                                            //-- Load the Premise Floor Options --//
                                                            me.LoadPremiseFloorsOptions({
                                                                onSuccess : function () {
                                                                    
                                                                    //-- Load the Premise Room Options --//
                                                                    me.LoadPremiseRoomsOptions({
                                                                        onSuccess : function () {
                                                                            
                                                                            //-- Do the next steps --//
                                                                            IOMy.functions.getCurrentUsername( function () {
                                                                                me.ReloadVariablePremiseList(fnCallback, fnFailCallback);
                                                                            });
                                                                            
                                                                        }
                                                                    });
                                                                    
                                                                }
                                                            });
                                                            
                                                        }
                                                    });
                                                    
                                                }
                                            });
                                            
                                        }
                                    });
                                    
                                }
                            });
                            
                        }
                    });
                    
                }
            });
        } else {
			//-- Keep running this function until the refresh is complete --//
			me.ReloadCoreVariables(fnCallback, fnFailCallback);
		}
    },
    
    /**
     * STEP 2 of 7: Procedure for refreshing the Premise List using an AJAX function.
     * 
     * Next step is refreshing the hub list if successful.
     */
    ReloadVariablePremiseList : function (fnCallback, fnFailCallback) {
        var me				= this;			//-- SCOPE:		Binds the scope to a variable so that this particular scope can be accessed by sub-functions --//
        
        if( me.isCoreVariablesRefreshInProgress(2, fnFailCallback)===false ) {
            me.CoreVariableRefreshStepsInProgress[1] = true;
            try {
                me.RefreshPremiseList({
                    onSuccess : function () {
                        me.ReloadVariableHubList(fnCallback, fnFailCallback);
                    },
                    
                    onFail : function () {
                        fnFailCallback();
                        
                        me.ResetCoreVariableRefreshFlags();
                    }
                });
            } catch (e) {
                me.ResetCoreVariableRefreshFlags();
                jQuery.sap.log.error("ReloadPremiseList Error! "+e.message);
            }
        } else {
			//-- Keep running this function until the refresh is complete --//
			me.ReloadVariablePremiseList(fnCallback, fnFailCallback);
		}
    },
    
    /**
     * STEP 3 of 7: Procedure for refreshing the Hub List using an AJAX function.
     * 
     * Next step is refreshing the room list if successful.
     */
    ReloadVariableHubList : function (fnCallback, fnFailCallback) {
        var me				= this;			//-- SCOPE:		Binds the scope to a variable so that this particular scope can be accessed by sub-functions --//
        
        if( me.isCoreVariablesRefreshInProgress(3, fnFailCallback)===false ) {
            me.CoreVariableRefreshStepsInProgress[2] = true;
            try {
                me.RefreshHubList({
                    onSuccess : function () {
                        me.ReloadVariableCommList(fnCallback, fnFailCallback);
                    },
                    
                    onFail : function () {
                        fnFailCallback();
                        
                        me.ResetCoreVariableRefreshFlags();
                    }
                });
            } catch (e) {
                me.ResetCoreVariableRefreshFlags();
                jQuery.sap.log.error("ReloadVariableHubList Error! "+e.message);
            }
        } else {
			//-- Keep running this function until the refresh is complete --//
			me.ReloadVariableHubList(fnCallback, fnFailCallback);
		}
    },
    
    /**
     * STEP 5 of 7: Procedure for refreshing the Comm List using an AJAX function.
     * 
     * Next step is refreshing the link type list if successful.
     */
    ReloadVariableCommList : function (fnCallback, fnFailCallback) {
        var me				= this;			//-- SCOPE:		Binds the scope to a variable so that this particular scope can be accessed by sub-functions --//
        
        if( me.isCoreVariablesRefreshInProgress(4, fnFailCallback)===false ) {
            me.CoreVariableRefreshStepsInProgress[3] = true;
            
            try {
                me.RefreshCommList({
                    onSuccess : function () {
                        me.ReloadVariableRoomList(fnCallback, fnFailCallback);
                    },
                    
                    onFail : function () {
                        fnFailCallback();
                        
                        me.ResetCoreVariableRefreshFlags();
                    }
                });
            } catch (e) {
                me.ResetCoreVariableRefreshFlags();
                jQuery.sap.log.error("ReloadVariableCommList Error! "+e.message);
            }
        } else {
			//-- Keep running this function until the refresh is complete --//
			me.ReloadVariableCommList(fnCallback, fnFailCallback);
		}
    },
    
    /**
     * STEP 4 of 7: Procedure for refreshing the Room List using an AJAX function.
     * 
     * Next step is refreshing the link list if successful.
     */
    ReloadVariableRoomList : function (fnCallback, fnFailCallback) {
        var me				= this;			//-- SCOPE:		Binds the scope to a variable so that this particular scope can be accessed by sub-functions --//
        
        if( me.isCoreVariablesRefreshInProgress(5, fnFailCallback)===false ) {
            me.CoreVariableRefreshStepsInProgress[4] = true;
            
            try {
                me.RetreiveRoomList({
                    onSuccess : function () {
                        me.ReloadVariableLinkList(fnCallback, fnFailCallback);
                    },
                    
                    onFail : function () {
                        fnFailCallback();
                        
                        me.ResetCoreVariableRefreshFlags();
                    }
                });
            } catch (e) {
                me.ResetCoreVariableRefreshFlags();
                jQuery.sap.log.error("ReloadVariableRoomList Error! "+e.message);
            }
        } else {
			//-- Keep running this function until the refresh is complete --//
			me.ReloadVariableRoomList(fnCallback, fnFailCallback);
		}
    },
	
	/**
     * STEP 5 of 7: Procedure for refreshing the Link List using an AJAX function.
     * 
     * Next step is refreshing the link type list if successful.
     */
    ReloadVariableLinkList : function (fnCallback, fnFailCallback) {
        var me				= this;			//-- SCOPE:		Binds the scope to a variable so that this particular scope can be accessed by sub-functions --//
        
        if( me.isCoreVariablesRefreshInProgress(6, fnFailCallback)===false ) {
            me.CoreVariableRefreshStepsInProgress[5] = true;
            
            try {
                me.RetrieveLinkList({
                    onSuccess : function () {
                        me.ReloadVariableLinkTypeList(fnCallback, fnFailCallback);
                    },
                    
                    onFail : function () {
                        fnFailCallback();
                        
                        me.ResetCoreVariableRefreshFlags();
                    }
                });
            } catch (e) {
                me.ResetCoreVariableRefreshFlags();
                jQuery.sap.log.error("ReloadVariableLinkList Error! "+e.message);
            }
        } else {
			//-- Keep running this function until the refresh is complete --//
			me.ReloadVariableLinkList(fnCallback, fnFailCallback);
		}
    },
    
    /**
     * STEP 6 of 7: Procedure for refreshing the Link Type List using an AJAX function.
     * 
     * Next step is refreshing the thing list if successful.
     */
    ReloadVariableLinkTypeList : function (fnCallback, fnFailCallback) {
        var me				= this;			//-- SCOPE:		Binds the scope to a variable so that this particular scope can be accessed by sub-functions --//
        
        if( me.isCoreVariablesRefreshInProgress(7, fnFailCallback)===false ) {
            me.CoreVariableRefreshStepsInProgress[6] = true;
            
            try {
                me.RetrieveLinkTypeList({
                    onSuccess : function () {
                        me.ReloadVariableThingList(fnCallback, fnFailCallback);
                    },
                    
                    onFail : function () {
                        fnFailCallback();
                        
                        me.ResetCoreVariableRefreshFlags();
                    }
                });
            } catch (e) {
                me.ResetCoreVariableRefreshFlags();
                jQuery.sap.log.error("ReloadVariableLinkTypeList Error! "+e.message);
            }
        } else {
			//-- Keep running this function until the refresh is complete --//
			me.ReloadVariableLinkTypeList(fnCallback, fnFailCallback);
		}
    },
    
    /**
     * STEP 7 of 7: Procedure for refreshing the Thing List using an AJAX function.
     * 
     * Either load the home page or whatever function is parsed.
     */
    ReloadVariableThingList : function (fnCallback, fnFailCallback) {
        var me				= this;			//-- SCOPE:		Binds the scope to a variable so that this particular scope can be accessed by sub-functions --//
        var fnOnComplete;
        var fnOnFail;
        
        //--------------------------------------------------------------------//
        // Collect the call back function or create an empty function.
        //--------------------------------------------------------------------//
        if (fnCallback !== undefined) {
            fnOnComplete = fnCallback;
        } else {
            fnOnComplete = function () {};
        }
        
        
        if (fnCallback !== undefined) {
            fnOnFail = fnFailCallback;
        } else {
            fnOnFail = function () {};
        }
        
        if( me.isCoreVariablesRefreshInProgress(8, fnFailCallback)===false ) {
            me.CoreVariableRefreshStepsInProgress[7] = true;
            
            try {
                IOMy.apiphp.RefreshThingList({
                    onSuccess   : function () {
                        fnOnComplete();
                        
                        me.ResetCoreVariableRefreshFlags();
                    },
                    onFail      : function () {
                        fnOnFail();
                        
                        me.ResetCoreVariableRefreshFlags();
                    }
                });
            } catch (e) {
                me.ResetCoreVariableRefreshFlags();
                jQuery.sap.log.error("ReloadVariableThingList Error! "+e.message);
            }
        } else {
			//-- Keep running this function until the refresh is complete --//
			me.ReloadVariableThingList(fnCallback, fnFailCallback);
		}
    },
    
    ResetCoreVariableRefreshFlags : function () {
        this.CoreVariableRefreshStepsInProgress = [       // BOOLEAN ARRAY: 
            false,  // Step 1
            false,  // Step 2
            false,  // Step 3
            false,  // Step 4
            false,  // Step 5
            false,  // Step 6
            false,  // Step 7
			false   // Step 8
        ];
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
			if( IOMy.common.bCoreRefreshInProgress===false ) {
				
				//-- Flag that the CoreVariables are refreshing --//
				IOMy.common.bCoreRefreshInProgress = true;
				
				//-- Remove the Restart flag --//
				IOMy.common.bCoreVariablesRestart = false;
				
				
				//----------------------------------------//
				//-- PART 1: REFRESH USERINFO LIST      --//
				//----------------------------------------//
				IOMy.common.RefreshUserInfoList({
					onSuccess: $.proxy( function() {
						
						//----------------------------------------//
						//-- PART 2: REFRESH PREMISE LIST       --//
						//----------------------------------------//
						IOMy.common.RefreshPremiseList({
							onSuccess: $.proxy( function() {
								
								//----------------------------------------//
								//-- PART 3: REFRESH HUB LIST           --//
								//----------------------------------------//
								IOMy.common.RefreshHubList({
									onSuccess: $.proxy( function() {
										
										//----------------------------------------//
										//-- PART 4: REFRESH COMM LIST          --//
										//----------------------------------------//
										IOMy.common.RefreshCommList({
											onSuccess: $.proxy( function() {
												
												//----------------------------------------//
												//-- PART 5: REFRESH ROOM LIST          --//
												//----------------------------------------//
												IOMy.common.RetreiveRoomList({
													onSuccess: $.proxy( function() {
														
														//----------------------------------------//
														//-- PART 6: REFRESH LINK LIST          --//
														//----------------------------------------//
														IOMy.common.RetrieveLinkList({
															onSuccess: $.proxy( function() {
																
																//----------------------------------------//
																//-- PART 7: REFRESH IO LIST            --//
																//----------------------------------------//
																IOMy.apiphp.RefreshThingList({
																	onSuccess: $.proxy( function() {
																		
																		//-------------------------------------------------------//
																		//-- Flag that the Core Variables have been configured --//
																		//-------------------------------------------------------//
																		IOMy.common.CoreVariablesInitialised = true;
																		
																		
																		//-------------------------------------------------------//
																		//-- Perform the onSuccess event                       --//
																		//-------------------------------------------------------//
																		try {
																			//-- Update when the last core variables occurred --//
																			var oTemp = new Date();
																			IOMy.common.iCoreVariablesLastRefresh = oTemp.getTime();
																			
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
																			if( IOMy.common.aCoreVariablesResConfig.length >= 1 ) {
																				$.each( IOMy.common.aCoreVariablesResConfig, function ( iIndex, aTempConfig ) {
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
																				IOMy.common.aCoreVariablesResConfig = [];
																			}
																			
																			//------------------------------------------------------------//
																			//-- If the Core Variables needs to restart on completion   --// 
																			if( IOMy.common.bCoreVariablesRestart===false ) {
																				//-- Turn off the "RefreshInProgress" state as the refresh has finished --//
																				IOMy.common.bCoreRefreshInProgress = false;
																				
																			} else {
																				//-- Replace the Current Config with the next --//
																				IOMy.common.aCoreVariablesResConfig = IOMy.common.aCoreVariablesResNextConfig;
																				
																				//-- Start the next refresh Core Variables --//
																				IOMy.common.bCoreRefreshInProgress = false;
																				IOMy.common.RefreshCoreVariables({});
																			}
																			
																		} catch( e00 ) {
																			jQuery.sap.log.error("Critical Error: Problem when doing the final processing in the RefreshCoreVariables function.\n"+e00.message);
																		}
																		
																	}, oScope),
																	onFail: $.proxy( function() {
																		IOMy.common.bCoreRefreshInProgress = false;
																		jQuery.sap.log.error("Error: Failed to update the ThingList for the RefreshCoreVariables function.");
																		
																	}, oScope)
																}); //-- END PART 7 ( IO LIST ) --//
																
															}, oScope),
															onFail: $.proxy(function() {
																IOMy.common.bCoreRefreshInProgress = false;
																jQuery.sap.log.error("Error: Failed to update the LinkList for the RefreshCoreVariables function.");
																
															}, oScope)
														}); //-- END PART 6 ( LINK LIST ) --//
														
													}, oScope),
													onFail: $.proxy(function() {
														IOMy.common.bCoreRefreshInProgress = false;
														jQuery.sap.log.error("Error: Failed to update the RoomList for the RefreshCoreVariables function.");
														
													}, oScope)
												}); //-- END PART 5 ( ROOMS LIST ) --//
												
											}, oScope),
											onFail: $.proxy(function() {
												IOMy.common.bCoreRefreshInProgress = false;
												jQuery.sap.log.error("Error: Failed to update the CommList for the RefreshCoreVariables function.");
												
											}, oScope)
										}); //-- END PART 4 ( COMM LIST ) --//
										
									}, oScope),
									onFail: $.proxy( function() {
										IOMy.common.bCoreRefreshInProgress = false;
										jQuery.sap.log.error("Error: Failed to update the HubList for the RefreshCoreVariables function.");
										
									}, oScope)
								}); //-- END PART 3 ( HUB LIST ) --//
								
							}, oScope),
							onFail: $.proxy( function() {
								IOMy.common.bCoreRefreshInProgress = false;
								jQuery.sap.log.error("Error: Failed to update the PremiseList for the RefreshCoreVariables function.");
								
							}, oScope)
						}); //-- END PART 2 ( PREMISE LIST ) --//
					}, oScope),
					onFail: $.proxy( function() {
						IOMy.common.bCoreRefreshInProgress = false;
						jQuery.sap.log.error("Error: Failed to update the UserInfoList for the RefreshCoreVariables function.");
						
					}, oScope)
				}); //-- END PART 1 ( USERINFO LIST ) --//
			} else {
				//-- Flag that the core variables will need to be refreshed again after is completes --//
				IOMy.common.bCoreVariablesRestart = true;
				
				//-- Push the current config into the array of what to do next --//
				IOMy.common.aCoreVariablesResNextConfig.push( aConfig );
				
			}
		} catch(e1) {
			jQuery.sap.log.error("RefreshCoreVariables Error! "+e1.message);
		}
	},
	
	/*
	 * This array is used as a Preset that is used after verifing that the user
	 * is logged in.
	 * 
	 * @type Array
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
	
	/*
	 * This function gets run in order to schedule a check to see if the
	 * Core Variables need refreshing.
	 */
	RefreshCoreVariableQueueCheck: function() {
		//----------------------------------------//
		//-- Clear existing timeout             --//
		//----------------------------------------//
		try {
			if( IOMy.common.oCoreVariableTimeout ) {
				clearTimeout( IOMy.common.oCoreVariableTimeout );
			}
		} catch( e0 ) {
			//-- Do nothing --//
		}
		
		//----------------------------------------//
		//-- Set new Timeout                    --//
		//----------------------------------------//
		try {
			IOMy.common.oCoreVariableTimeout = setTimeout(
				function() {
					IOMy.common.RefreshCoreVariablesCheckEvent();
				},
				IOMy.common.iCoreVariablesRefreshInterval
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
		var iCurrentTime   = oDate.getTime()
		var iLastRefresh   = IOMy.common.iCoreVariablesLastRefresh;
		var iDurationLimit = IOMy.common.iCoreVariablesRefreshInterval;
		//-- Check how long ago the last refresh occurred --//
		if( ( iCurrentTime - iLastRefresh ) >= iDurationLimit ) {
			//-- IF RefreshCoreVariables is not running --//
			if( IOMy.common.bCoreRefreshInProgress===false ) {
				//-------------------------------------------------------------//
				//-- OUTCOME A: Refresh                                      --//
				//-------------------------------------------------------------//
				
				//-- Execute the RefreshCoreVariables --//
				IOMy.common.RefreshCoreVariables(
					{
						onSuccess: $.proxy( function() {
							//--------------------------------------------------------//
							//-- Queue up the next refreshcore variables check so   --//
							//-- that it can execute at the desired time            --//
							//--------------------------------------------------------//
							IOMy.common.RefreshCoreVariableQueueCheck();
						}, oScope)
					},
					oScope
				);
			} else {
				//-------------------------------------------------------------//
				//-- OUTCOME B: Reschedule due to it already being performed --//
				//-------------------------------------------------------------//
				
				//-- Queue up the next AutoCheck to happen --//
				IOMy.common.RefreshCoreVariableQueueCheck();
			}
		} else {
			//-------------------------------------------------------------//
			//-- OUTCOME C: Reschedule due to already up to date         --//
			//-------------------------------------------------------------//
			
			//-- Queue up the next AutoCheck to happen --//
			IOMy.common.RefreshCoreVariableQueueCheck();
		}
	},
	
	
	//================================================================//
	//== Refresh Optional Variables                                 ==//
	//================================================================//
	RefreshOptionalVariables: function( aConfig ) {
		//-- NOTES: These should only be polled if they are needed and not on every login attempt. --//
		//-- TODO: Fix this in a future version so they are only fetched from the APIs when a page that gets loaded depends upon that particular list --//
		var me				= this;			//-- SCOPE:		Binds the scope to a variable so that this particular scope can be accessed by sub-functions --//
		
		
		try {
			
			//------------------------------------------------//
			//-- PART 1A - Load the Regions                 --//
			//------------------------------------------------//
			IOMy.common.LoadRegions({
				onSuccess: $.proxy( function () {
					//------------------------------------------------//
					//-- PART 1B - Load the Languages                --//
					//------------------------------------------------//
					IOMy.common.LoadLanguages({
						onSuccess: $.proxy( function() {
							//------------------------------------------------//
							//-- PART 1C - Load the Timezones                --//
							//------------------------------------------------//
							IOMy.common.LoadTimezones({
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
			IOMy.common.RetrieveLinkTypeList({
				onSuccess: $.proxy( function() {
					//------------------------------------------------//
					//-- PART 2B - Load the Premise Bedroom Options  --//
					//------------------------------------------------//
					IOMy.common.LoadPremiseBedroomsOptions({
						onSuccess: $.proxy( function() {
							//------------------------------------------------//
							//-- PART 2C - Load the Premise Occupant Options --//
							//------------------------------------------------//
							IOMy.common.LoadPremiseOccupantsOptions({
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
			IOMy.common.LoadRoomTypes({
				onSuccess: $.proxy( function() {
					//------------------------------------------------//
					//-- PART 3B - Load the Premise Floor Options   --//
					//------------------------------------------------//
					IOMy.common.LoadPremiseFloorsOptions({
						onSuccess: $.proxy( function() {
							//------------------------------------------------//
							//-- PART 3C - Load the Premise Room Options    --//
							//------------------------------------------------//
							IOMy.common.LoadPremiseRoomsOptions({
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
		
		IOMy.apiodata.AjaxRequest({
			Url: IOMy.apiodata.ODataLocation("users"),
			Columns: [
				"USERADDRESS_LINE1",        "USERADDRESS_LINE2",        "USERADDRESS_LINE3",        
				"USERADDRESS_SUBREGION",    "USERADDRESS_POSTCODE",     "REGION_PK",                
				"LANGUAGE_PK",              "TIMEZONE_PK",              "TIMEZONE_CC",              
				"TIMEZONE_LATITUDE",        "TIMEZONE_LONGITUDE",       "TIMEZONE_TZ",              
				"USERSINFO_PK",             "USERSINFO_TITLE",          "USERSINFO_DISPLAYNAME",    
				"USERS_USERNAME"
			],
			WhereClause: [],
			OrderByClause: [],
			onSuccess : function ( sResponseType, aData ) {
				IOMy.common.UserInfo = {
					"AddressLine1":       aData[0].USERADDRESS_LINE1,
					"AddressLine2":       aData[0].USERADDRESS_LINE2,
					"AddressLine3":       aData[0].USERADDRESS_LINE3,
					"Postcode":           aData[0].USERADDRESS_POSTCODE,
					"SubRegionId":        aData[0].USERADDRESS_SUBREGION,
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
				};
				
				//-- Update the Timestamp on when the UserInfo was last updated --//
				IOMy.common.UserInfoLastUpdate = new Date();
				
				//-- Store the Username --//
				IOMy.common.CurrentUsername = aData[0].USERS_USERNAME;
				IOMy.common.UserDisplayName = aData[0].USERSINFO_DISPLAYNAME;
					
				//-- Perform the "onSuccess" function if applicable --//
				if(oConfig.onSuccess !== undefined) {
					oConfig.onSuccess();
				}
			},
			
			onFail : function (response) {
				jQuery.sap.log.error("Error refreshing UserInfo list: "+JSON.stringify(Response));
				
				//-- Perform the "onFail" function if applicable --//
				if(oConfig.onFail) {
					oConfig.onFail();
				}
			}
		});
	},
	
	
	//================================================================//
	//== PREMISE LIST   											==//
	//================================================================//
	RefreshPremiseList : function (oConfig) {
		var me = this;
		
		IOMy.apiodata.AjaxRequest({
			Url : IOMy.apiodata.ODataLocation("premises"),
			Columns : [
                "PREMISE_PK", "PREMISE_NAME", "PREMISE_DESCRIPTION", "PERMPREMISE_WRITE", "PERMPREMISE_OWNER",
                "PREMISEFLOORS_PK", "PREMISEROOMS_PK", "PREMISEBEDROOMS_PK", "PREMISEOCCUPANTS_PK",
                "PREMISEFLOORS_NAME", "PREMISEROOMS_NAME", "PREMISEBEDROOMS_COUNT", "PREMISEOCCUPANTS_NAME",
                "PERMPREMISE_ROOMADMIN"
            ],
			WhereClause : [],
			OrderByClause : ["PREMISE_NAME asc"],
			
			onSuccess : function (responseType, data) {
				me.PremiseList = [];
				
				for (var i = 0; i < data.length; i++) {
					me.PremiseList.push({
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
					});
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
	//== HUB LIST   												==//
	//================================================================//
	RefreshHubList : function (oConfig) {
		var me = this;
		
		IOMy.apiodata.AjaxRequest({
			Url : IOMy.apiodata.ODataLocation("hubs"),
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
				me.HubList = [];
				
				for (var i = 0; i < aData.length; i++) {
					me.HubList.push({
						"PermRead":					aData[i].PERMPREMISE_READ,
						"PermWrite":				aData[i].PERMPREMISE_WRITE,
						"PermOwner":				aData[i].PERMPREMISE_OWNER,
						"PremiseId":				aData[i].PREMISE_PK,
						"PremiseName":				aData[i].PREMISE_NAME,
						"HubId":                    aData[i].HUB_PK,
						"HubName":                  aData[i].HUB_NAME,
						"HubSerial":                aData[i].HUB_SERIALNUMBER,
						"HubIPAddress":             aData[i].HUB_IPADDRESS,
						"HubTypeId":                aData[i].HUBTYPE_PK,
						"HubTypeName":              aData[i].HUBTYPE_NAME
					});
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
	//== Retrieve the Rooms List from the database					==//
	//================================================================//
	RetreiveRoomList: function( oConfig ) {
		var me = this; 
		
		//------------------------------------//
		//-- ODATA REQUEST PREP				--//
		//------------------------------------//
		var sUrl			= IOMy.apiodata.ODataLocation("rooms");
		var aColumns		= [ "ROOMS_PREMISE_FK", "ROOMS_PK", "ROOMS_NAME", "ROOMS_DESC", "ROOMS_FLOOR", "ROOMTYPE_PK", "ROOMTYPE_NAME", "ROOMTYPE_OUTDOORS" ];
		var aWhere			= [];
		var aOrderBy		= [ "ROOMS_PREMISE_FK", "ROOMTYPE_OUTDOORS", "ROOMS_PK" ];
		
		me.RoomsList = {};
		//------------------------//
		//-- ODATA REQUEST		--//
		//------------------------//
		IOMy.apiodata.AjaxRequest( {
			Url:				sUrl,
			HTTPMethod:			"GET",
			DataType:			"json",
			Columns:			aColumns,
			WhereClause:		aWhere,
			OrderByClause:		aOrderBy,
			
			//----------------------------//
			//-- 3.A - ON AJAX FAILURE	--//
			//----------------------------//
			onFail : function(response) {
				jQuery.sap.log.error("RoomLookup Error!");
                
                //-- Perform the "onFail" function if applicable --//
                if(oConfig.onFail) {
					oConfig.onFail();
				}
			},
		
			//--------------------------------//
			//-- 3.B - ON AJAX SUCCESS		--//
			//--------------------------------//
			onSuccess : $.proxy(function(sReturnDataType, AjaxData) {
				try {
					
					var iPremiseId		= 0;			//-- INTEGER:	--//
					var iRoomId			= 0;			//-- INTEGER:	--//
					var aTemp			= {};			//-- ARRAY:		Temporary Associative array used to temporarily store room data --//
					
					//--------------------------------------------------------//
					//-- 3.B.A - Check to see how many rooms are found	--//
					//--------------------------------------------------------//
					if( AjaxData.length >= 1 ) {
						//--------------------------------------------------------//
						//-- 3.B.A.1 - Store the Data in the Rooms List			--//
						//--------------------------------------------------------//
						for (var i = 0; i < AjaxData.length; i++) {
							
							iPremiseId		= parseInt( AjaxData[i].ROOMS_PREMISE_FK );
							iRoomId			= parseInt( AjaxData[i].ROOMS_PK );
							
							if( iPremiseId>=1 && iRoomId>=1 ) {
								//------------------------------------------------------------//
								//-- 3.B.A.1.2 - Check if the Premise Id needs to be setup	--//
								//------------------------------------------------------------//
								if( !IOMy.common.RoomsList["_"+iPremiseId] ) {
									//-- Create the Premise --//
									IOMy.common.RoomsList["_"+iPremiseId] = {};
								}
								
								//------------------------------------------------------------//
								//-- 3.B.A.1.3 - Check if the Room needs to be setup		--//
								//------------------------------------------------------------//
								if( !IOMy.common.RoomsList["_"+iPremiseId]["_"+iRoomId] ) {
									//-- Create the Room --//
									IOMy.common.RoomsList["_"+iPremiseId]["_"+iRoomId] = [];
								}
								
								//-- Reset the array --//
								aTemp	= {};
								
								//-- Store the values --//
								aTemp.PremiseId				= iPremiseId;
								aTemp.PremiseName			= "";
								
								aTemp.RoomId				= iRoomId;
								aTemp.RoomName				= AjaxData[i].ROOMS_NAME;
								aTemp.RoomDesc				= AjaxData[i].ROOMS_DESC;
								aTemp.RoomFloor				= AjaxData[i].ROOMS_FLOOR;
								aTemp.RoomTypeId			= parseInt( AjaxData[i].ROOMTYPE_PK );
								aTemp.RoomTypeName			= AjaxData[i].ROOMTYPE_NAME;
								aTemp.RoomTypeOutdoors		= parseInt( AjaxData[i].ROOMTYPE_OUTDOORS );
								
								//-- Lookup the Premise Name and position in the PremiseList --//
								$.each( IOMy.common.PremiseList, function( Key, aPremise ) {
									if( aPremise.Id===iPremiseId.toString() ) {
										//-- Add the Premise Name --//
										aTemp.PremiseName	 = aPremise.Name;
										//-- NOTE: This will need to be removed if we convert the RoomList from an iterative array to a associative array --//
										aTemp.PremiseListKey = Key;
									}
								});
								
								//-- Array to store the Things in --//
								aTemp.Things	= {};
								
								if( !IOMy.common.RoomsList["_"+iPremiseId] ) {
									IOMy.common.RoomsList["_"+iPremiseId] = {};
								}
								
								IOMy.common.RoomsList["_"+iPremiseId]["_"+iRoomId] = {};
								
								IOMy.common.RoomsList["_"+iPremiseId]["_"+iRoomId] = aTemp;
							} else {
								console.log("Invalid PremiseId or RoomId");
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
					console.log("LoginRoomsList Error 11: "+e11.message);
					//-- Perform the "onFail" function if applicable --//
                    if(oConfig.onFail) {
                        oConfig.onFail();
                    }
				}
			})
		});
	},
	//============================================================//
	//== DEVICE IN DEVICE LIST									==//
	//============================================================//
	ThingInThingList: function( iTempThingId ) {
		
		
		var me				= this;				//-- SCOPE:			--//
		var bFoundThing		= false;			//-- BOOLEAN:		--//
		var sThingIndex		= "";				//-- STRING:	Most likely an integer under ideal conditions --//
		var aReturn			= {};				//-- ARRAY:		An array used to return the results --//
		
		//------------------------//
		//-- Error Catching		--//
		try {
			//----------------------------//
			//-- Foreach device			--//
			$.each( IOMy.common.ThingList, function( sIndex, oThing )  {
				
				//-- Check if the Thing Ids match --//
				if( oThing.Id === iTempThingId ) {
					//-- Store the found device Id --//
					bFoundThing	= true;
					sThingIndex	= sIndex;
					
				}
				
			});
			
			//-- If a device wasn't found --//
			if( bFoundThing===false ) {
				//-- Setup the Return variable so that a device hadn't been found --//
				aReturn = { "Error":false,	"ThingFound": false };
				
			} else {
				//-- Setup the Return variable to return that  --//
				aReturn = { "Error":false, "ThingFound": true, "ArrayId": sThingIndex 	};
			}
			
		
		
		} catch( e1 ) {
			//------------------------//
			//-- ERROR				--//
			//------------------------//
			aReturn = { "Error":true };
			
		}
	},
	
	//====================================================================//
	//== Search the Thing List for a IO									==//
	//====================================================================//
	SearchThingListForIO: function(iIOId) {
		//------------------------------------------------------------------------------------------------//
		//-- Initialise Variables																		--//
		//------------------------------------------------------------------------------------------------//
		var bIdMatch			= false;		//-- BOOLEAN: Used to indicate when a match for the Ids have		--//
		var iThingId			= 0;			//-- INTEGER: Used to store the device id for the found IO		--//
		var iThingPortId		= 0;			//-- INTEGER: Used to store the index of the array when a match on the device id is found --//
		var aReturn				= {};			//-- ARRAY:			--//
		
		//------------------------------------------------------------------------------------------------//
		//-- 2.0 - Begin the search of the Thing List													--//
		//------------------------------------------------------------------------------------------------//
		$.each( IOMy.common.ThingList , function( iThingIndex, aThing ) {
			//-- If a match hasn't been found --//
			if( bIdMatch===false ) {
				//-- Verify that the Index and device exist (filters unwanted results out) --//
				if( iThingIndex!==undefined && iThingIndex!==null && aThing!==undefined && aThing!==null ) {
					
					//------------------------------------//
					//-- 2.1 - Foreach ThingPort		--//
					//------------------------------------//
					$.each( aThing.Ports, function( iThingIndex, aThing ) {
						if( bIdMatch===false ) {
							if( iThingIndex!==undefined && iThingIndex!==null && aThing!==undefined && aThing!==null ) {
								
								//------------------------------------//
								//-- 2.1.1 - Foreach IO			--//
								//------------------------------------//
								$.each( aThing.IO, function( iIOIndex, aIO ) {
									if( bIdMatch===false ) {
										if( iIOIndex!==undefined && iIOIndex!==null && aIO!==undefined && aIO!==null ) {
											
											//--  --//
											if( aIO.Id===iIOId ) {
												bIdMatch = true;
												
												aReturn = {
													"MatchFound": true,
													"ThingId": aThing.Id
												};
											}
										}
									}
								});		//-- END FOREACH SENSOR --//
							}
						}
					});		//-- END FOREACH DEVICEPORT --//
				}
			}
		});
		
		
		//------------------------------------------------------------------------------------------------//
		//-- PART 2 - Return the Results																--//
		//------------------------------------------------------------------------------------------------//
		
		
		//-- If a match is found then return the Index of the device --//
		if( bIdMatch===true ) {
			return aReturn;
			
		//-- Else return negative one if no match is found --//
		} else {
			aReturn = { "MatchFound":false };
			return aReturn;
		}
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
		//-- Restart the status of the extras menu      --//
        IOMy.widgets.extrasMenuOpen = false;
        
		//-- Declare aPageData as an associative array if undefined --//
		aPageData = aPageData || {};
		
		if( typeof bResetNavArray === 'undefined' ) {
			bResetNavArray = false;
		}
		
		//-- If Reset needed --//
		if( bResetNavArray===true) {
			
			if( sPageName!==IOMy.common.sNavigationDefaultPage ) {
				IOMy.common.NavPagesNavigationArray = [
					{
						"Name": IOMy.common.sNavigationDefaultPage,
						"Data": {}
					}
				];
				
				//-- Empty the Navigation Array Index --//
				IOMy.common.NavPagesCurrentIndex = 0;
			} else {
				//-- Empty the array --//
				IOMy.common.NavPagesNavigationArray = [];
				IOMy.common.NavPagesCurrentIndex = -1;
			} 
			
		} else if( IOMy.common.NavPagesCurrentIndex<=-1 ) {
			
			//-- If on the Default Page then always reset the Navigation Array --//
			IOMy.common.NavPagesNavigationArray = [
				{
					"Name": IOMy.common.sNavigationDefaultPage,
					"Data": {}
				}
			];
			//-- Set the index back to normal --//
			IOMy.common.NavPagesCurrentIndex = 0;
			
			//jQuery.sap.log.debug("Empty Navigation");
			
		} else {
			//-- Setup the Index to current
			//if( IOMy.common.NavPagesCurrentIndex<=-1 ) {
			//	IOMy.common.NavPagesCurrentIndex = 0;
			//}
			
			if( IOMy.common.NavPagesNavigationArray.length >= IOMy.common.NavPagesCurrentIndex ) {
				//-- If there is more Pages stored in the forward side of the array then the array can have those forward pages removed --//
				var iIteration			= this.NavPagesCurrentIndex;
				var iMaxIterations		= this.NavPagesNavigationArray.length;
				//-- Remove the unnecessary elements in the array --//
				this.NavPagesNavigationArray.splice( (iIteration+1), (iMaxIterations-iIteration) );
				//jQuery.sap.log.debug("Empty Navigation Partial");
			} else {
				//jQuery.sap.log.debug("No Emptying of Navigation");
			}
			

		}
		
		//-- Add the page to the Array --//
		this.NavPagesNavigationArray.push( { "Name":sPageName, "Data":aPageData } );
		//-- Increment the Index --//
		this.NavPagesCurrentIndex++;
		
		//-- Debugging --//
		//jQuery.sap.log.debug( "ChangePage NavArray="+JSON.stringify(this.NavPagesNavigationArray) );
		//jQuery.sap.log.debug( "ChangePage NavIndex="+JSON.stringify(this.NavPagesCurrentIndex ) );
		
		//-- Navigate to the new Page --//
		oApp.to( sPageName, aPageData );
		
	},
	
	//----------------------------------------------------------------------------------------//
	//-- This function is used to change pages either pack or forward ( depending on what	--//
	//-- the user has clicked )																--//
	//----------------------------------------------------------------------------------------//
	NavigationTriggerBackForward: function( bForwardTriggered ) {
		//-- Restart the status of the extras menu      --//
        IOMy.widgets.extrasMenuOpen = false;
        
        // Declare variables
		var sName		= "";
		var aData		= {};
		
		//-- IF the app requested to go forward a page --//
		if( bForwardTriggered===true ) {
			if( IOMy.common.NavPagesNavigationArray.length > (IOMy.common.NavPagesCurrentIndex+1) ) {
				//-- Increase the Current Index back to the next value --//
				//jQuery.sap.log.debug("NavForward CurrentLength="+IOMy.common.NavPagesNavigationArray.length);
				//jQuery.sap.log.debug("NavForward CurrentIndex="+IOMy.common.NavPagesCurrentIndex);
				IOMy.common.NavPagesCurrentIndex++;
				//jQuery.sap.log.debug("NavForward NewIndex="+IOMy.common.NavPagesCurrentIndex);
				sName = IOMy.common.NavPagesNavigationArray[IOMy.common.NavPagesCurrentIndex].Name;
				aData = IOMy.common.NavPagesNavigationArray[IOMy.common.NavPagesCurrentIndex].Data;
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
			if( IOMy.common.NavPagesCurrentIndex<=0) {
				//-- Set the index to zero (aka Default Page) --//
				IOMy.common.NavPagesCurrentIndex = -1;
				//-- Navigate back to the Default Page --//
				oApp.to( IOMy.common.sNavigationDefaultPage, "c_SlideBack", {} );
				
			} else {
				//-- Decrease the Current Index back to the previous value --//
				//jQuery.sap.log.debug("NavBack CurrentIndex="+IOMy.common.NavPagesCurrentIndex);
				IOMy.common.NavPagesCurrentIndex--;
				//jQuery.sap.log.debug("NavBack NewIndex="+IOMy.common.NavPagesCurrentIndex);
				
				sName = IOMy.common.NavPagesNavigationArray[IOMy.common.NavPagesCurrentIndex].Name;
				aData = IOMy.common.NavPagesNavigationArray[IOMy.common.NavPagesCurrentIndex].Data;
				
				//jQuery.sap.log.debug("NavBack NavArray="+JSON.stringify(IOMy.common.NavPagesNavigationArray) );
				//jQuery.sap.log.debug("NavBack BackPage="+JSON.stringify(IOMy.common.NavPagesNavigationArray[IOMy.common.NavPagesCurrentIndex]) );
				//-- Navigate back to the previous Page --//
				oApp.to( sName, "c_SlideBack", aData );
			}
			//-- Return Success --//
			return true;
		}
	},
	
	
	NavigationReturnToHome: function() {
		//-- Restart the status of the extras menu      --//
        IOMy.widgets.extrasMenuOpen = false;

        // Purge the navigation history.
        IOMy.common.NavPagesNavigationArray = [
            {
                "Name": IOMy.common.sNavigationDefaultPage,
                "Data": {}
            }
        ];
        //-- Set the index to zero (aka Navigation Main Page) --//
        IOMy.common.NavPagesCurrentIndex = -1;
        //-- Navigate back to the "Navigation Main" Page --//
        oApp.to( IOMy.common.sNavigationDefaultPage, "c_SlideBack", {} );
		
		return true;
	},
	
	NavigationForwardPresent: function() {
		jQuery.sap.log.debug("Array="+IOMy.common.NavPagesNavigationArray.length+"  Index="+IOMy.common.NavPagesCurrentIndex)
		
		if( IOMy.common.NavPagesNavigationArray.length > (IOMy.common.NavPagesCurrentIndex+1) ) {
			return true;
		} else {
			return false;
		}
	},
	
	
	NavigationRefreshButtons: function( oController ) {
        //------------------------------------------------//
		//-- Restart the status of the extras menu      --//
		//------------------------------------------------//
        IOMy.widgets.extrasMenuOpen = false;
        
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
		//jQuery.sap.log.debug("Array="+IOMy.common.NavPagesNavigationArray.length+"  Index="+IOMy.common.NavPagesCurrentIndex)
		
		
		
		//------------------------------------------------//
		//-- 3.0 - Check if Forward should be present   --//
		//------------------------------------------------//
		
		//-- If the Current Index is not flagged as needing to be reset --//
		if( IOMy.common.NavPagesCurrentIndex >= 0) {
			if( IOMy.common.NavPagesNavigationArray.length > (IOMy.common.NavPagesCurrentIndex+1) ) {
				bForwardPresent		= true;
			} 
		}
		
		//------------------------------------------------//
		//-- 4.0 - Check if Back should be present      --//
		//------------------------------------------------//
		if( IOMy.common.NavPagesCurrentIndex >= 1 ) {
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
		
		
		
		
	}
	
});

//----------------------------------------------------------------------------//
// Load the other methods and properties
//----------------------------------------------------------------------------//
$.sap.registerModulePath('IOMy.common', sModuleInitialBuildLocation+'util/common');
$.sap.require("IOMy.common.createExtraThingProperties");

$.sap.registerModulePath('IOMy.common', sModuleInitialBuildLocation+'util/common');
$.sap.require("IOMy.common.hasRoomAdminAccess");

$.sap.registerModulePath('IOMy.common', sModuleInitialBuildLocation+'util/common');
$.sap.require("IOMy.common.LoadRoomTypes");

$.sap.registerModulePath('IOMy.common', sModuleInitialBuildLocation+'util/common');
$.sap.require("IOMy.common.LoadPremiseBedroomsOptions");

$.sap.registerModulePath('IOMy.common', sModuleInitialBuildLocation+'util/common');
$.sap.require("IOMy.common.LoadPremiseFloorsOptions");

$.sap.registerModulePath('IOMy.common', sModuleInitialBuildLocation+'util/common');
$.sap.require("IOMy.common.LoadPremiseOccupantsOptions");

$.sap.registerModulePath('IOMy.common', sModuleInitialBuildLocation+'util/common');
$.sap.require("IOMy.common.LoadPremiseRoomsOptions");

$.sap.registerModulePath('IOMy.common', sModuleInitialBuildLocation+'util/common');
$.sap.require("IOMy.common.CommList");

$.sap.registerModulePath('IOMy.common', sModuleInitialBuildLocation+'util/common');
$.sap.require("IOMy.common.isCoreVariablesRefreshInProgress");


//----------------------------------------------------------------------------//
// Getters
//----------------------------------------------------------------------------//
$.sap.registerModulePath('IOMy.common', sModuleInitialBuildLocation+'util/common');
$.sap.require("IOMy.common.getters");