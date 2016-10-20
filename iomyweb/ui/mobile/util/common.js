/*
Title: Common functions and variables Module
Authors: 
    Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
    Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Module for creating and holding global variables for our lists in iOmy,
    dialog boxes, flags, navigation, settings, etc. Things that are commonly used in
    iOmy.
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
	
	
	//============================================//
	//== USER VARIABLES							==//
	//============================================//
	//-- Arrays used to store the User's variables
	//--------------------------------------------//
	UserVars : {},			//-- TODO: Check if this variable is still used anywhere --//
	
	UserInfo : {},
	
	
	UserAppVariables: {
		"PagePerms": {
			"SettingsThingList":	false,		//-- BOOLEAN:	Flags if the User is allowed to access the "SettingsThingList" Page.		--//
			"SettingsPremiseList":	false,		//-- BOOLEAN:	Flags if the User is allowed to access the "SettingsPremiseList" Page.		--//
		}
		
	},
	
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
				IOMy.common.showError(sErrMesg, "Authentication Error");
				
				return false;
				
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
		
		iReturn = parseInt( dDesiredDate/1000, 10 );
		
		return 0;
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
		
		// open a fully configured message box
		sap.m.MessageBox.show(
			sMessage,
			{
				icon: sap.m.MessageBox.Icon.SUCCESS,
				title: sTitle,
				actions: sap.m.MessageBox.Action.CLOSE,
				onClose: callbackFn,
				styleClass : cssClass
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
	
	showConfirmQuestion : function( sMessage, sTitle, fnCallback, sCssClass ){
		//-- --//
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
				//IOMy.util.Util.showError(errorMessage);
			}
		}
	},
    
    
    //================================================================//
	//== Retrieve Link Information									==//
	//================================================================//
	RetrieveLinkList : function (oConfig) {
        var me = this;
        
        IOMy.apiodata.AjaxRequest({
			Url : IOMy.apiodata.ODataLocation("link"),
			Columns : [
                "PREMISE_PK","LINK_PK","LINK_SERIALCODE","LINK_NAME","LINK_CONNECTED",
                "LINK_STATE","LINKTYPE_PK","LINKTYPE_NAME","LINK_ROOMS_FK"
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
                        "LinkRoomId" : data[i].LINK_ROOMS_FK,
                        "LinkTypeId" : data[i].LINKTYPE_PK,
                        "LinkTypeName" : data[i].LINKTYPE_NAME,
                        "LinkConnId" : data[i].LINKCONN_PK,
                        "LinkConnName" : data[i].LINKCONN_NAME,
                        "LinkConnAddress" : data[i].LINKCONN_ADDRESS,
                        "LinkConnUsername" : data[i].LINKCONN_USERNAME,
                        "LinkConnPassword" : data[i].LINKCONN_PASSWORD,
                        "LinkConnPort" : data[i].LINKCONN_PORT,
                        "PremiseId" : data[i].PREMISE_PK
					});
				}
				
				//-- Update the Timestamp on when the LinkList was last updated --//
				me.LinkListLastUpdate = new Date();
                
				//-- Perform the "onSuccess" function if applicable --//
				if(oConfig.onSuccess !== undefined) {
					oConfig.onSuccess();
				}
			},
			
			onFail : function (response) {
				jQuery.sap.log.error("Error refreshing link list: "+JSON.stringify(response));
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
				
				//-- Perform the "onSuccess" function if applicable --//
				if(oConfig.onSuccess !== undefined) {
					oConfig.onSuccess();
				}
			},
			
			onFail : function (response) {
				jQuery.sap.log.error("Error refreshing link list: "+JSON.stringify(response));
                //-- Perform the "onSuccess" function if applicable --//
				if(oConfig.onSuccess !== undefined) {
					oConfig.onSuccess();
				}
			}
		});
    },
    
    //========================================================================//
    // REFRESH CORE VARIABLE FUNCTIONS
    //========================================================================//
    
    /**
     * Starts the procession of procedures that will refresh core variables. These
     * are the variables being refreshed.
     * 
     * 1. Premise List
     * 2. Hub List
     * 3. Room List
     * 4. Link List
     * 5. Link Type List
     * 6. Thing List
     * 
     * There are six steps.
     */
    ReloadCoreVariables : function (fnCallback) {
        this.ReloadVariablePremiseList(fnCallback);
    },
    
    /**
     * STEP 1 of 6: Procedure for refreshing the Premise List using an AJAX function.
     * 
     * Next step is refreshing the hub list if successful.
     */
    ReloadVariablePremiseList : function (fnCallback) {
        var me				= this;			//-- SCOPE:		Binds the scope to a variable so that this particular scope can be accessed by sub-functions --//
        
        try {
            me.RefreshPremiseList({
				onSuccess : function () {
                    me.ReloadVariableHubList(fnCallback);
                }
            });
        } catch (e) {
            jQuery.sap.log.error("ReloadPremiseList Error! "+e.message);
        }
    },
    
    /**
     * STEP 2 of 6: Procedure for refreshing the Hub List using an AJAX function.
     * 
     * Next step is refreshing the room list if successful.
     */
    ReloadVariableHubList : function (fnCallback) {
        var me				= this;			//-- SCOPE:		Binds the scope to a variable so that this particular scope can be accessed by sub-functions --//
        
        try {
            me.RefreshHubList({
				onSuccess : function () {
                    me.ReloadVariableRoomList(fnCallback);
                }
            });
        } catch (e) {
            jQuery.sap.log.error("ReloadVariableHubList Error! "+e.message);
        }
    },
    
    /**
     * STEP 3 of 6: Procedure for refreshing the Room List using an AJAX function.
     * 
     * Next step is refreshing the link list if successful.
     */
    ReloadVariableRoomList : function (fnCallback) {
        var me				= this;			//-- SCOPE:		Binds the scope to a variable so that this particular scope can be accessed by sub-functions --//
        
        try {
            me.RetreiveRoomList({
				onSuccess : function () {
                    me.ReloadVariableLinkList(fnCallback);
                }
            });
        } catch (e) {
            jQuery.sap.log.error("ReloadVariableRoomList Error! "+e.message);
        }
    },
    
    /**
     * STEP 4 of 6: Procedure for refreshing the Link List using an AJAX function.
     * 
     * Next step is refreshing the link type list if successful.
     */
    ReloadVariableLinkList : function (fnCallback) {
        var me				= this;			//-- SCOPE:		Binds the scope to a variable so that this particular scope can be accessed by sub-functions --//
        
        try {
            me.RetrieveLinkList({
				onSuccess : function () {
                    me.ReloadVariableLinkTypeList(fnCallback);
                }
            });
        } catch (e) {
            jQuery.sap.log.error("ReloadVariableLinkList Error! "+e.message);
        }
    },
    
    /**
     * STEP 5 of 6: Procedure for refreshing the Link Type List using an AJAX function.
     * 
     * Next step is refreshing the thing list if successful.
     */
    ReloadVariableLinkTypeList : function (fnCallback) {
        var me				= this;			//-- SCOPE:		Binds the scope to a variable so that this particular scope can be accessed by sub-functions --//
        
        try {
            me.RetrieveLinkTypeList({
				onSuccess : function () {
                    me.ReloadVariableThingList(fnCallback);
                }
            });
        } catch (e) {
            jQuery.sap.log.error("ReloadVariableLinkTypeList Error! "+e.message);
        }
    },
    
    /**
     * STEP 6 of 6: Procedure for refreshing the Thing List using an AJAX function.
     * 
     * Either load the home page or whatever function is parsed.
     */
    ReloadVariableThingList : function (fnCallback) {
        var me				= this;			//-- SCOPE:		Binds the scope to a variable so that this particular scope can be accessed by sub-functions --//
        var fnOnComplete;
        
        //------------------------------------------------------//
        // Collect the call back function or create the default function, which
        // is to carry the user to the home page.
        //------------------------------------------------------//
        if (fnCallback !== undefined)
            fnOnComplete = fnCallback;
        else
            fnOnComplete = function () {};
        
        try {
            IOMy.apiphp.RefreshThingList({
				onSuccess : fnOnComplete
            });
        } catch (e) {
            jQuery.sap.log.error("ReloadVariableThingList Error! "+e.message);
        }
    },
	
	//================================================================//
	//== Refresh Variables											==//
	//================================================================//
	RefreshCoreVariables: function(bFirstLogin) {
		//-- NOTE1: bFirstLogin should always be set to false with the exception of the first time it is loaded when the user logs in! --//
		var me				= this;			//-- SCOPE:		Binds the scope to a variable so that this particular scope can be accessed by sub-functions --//
		
		try {
			//-- REFRESH PREMISE LIST --//
			me.RefreshPremiseList({
				onSuccess : function () {
					//-- REFRESH HUB LIST --//
                    IOMy.common.RefreshHubList({
                        onSuccess: $.proxy(function () {
                            
                            //-- REFRESH ROOM LIST --//
                            IOMy.common.RetreiveRoomList({
                                onSuccess: $.proxy(function() {

                                    //-- REFRESH LINK LIST --//
                                    IOMy.common.RetrieveLinkList( {
                                        onSuccess: $.proxy(function() {

//                                            //-- REFRESH LINK TYPES LIST --//
                                            IOMy.common.RetrieveLinkTypeList( {
                                                onSuccess : function () {
                                                    //-- REFRESH IO LIST --//
                                                    IOMy.apiphp.RefreshThingList( {
                                                        onSuccess: $.proxy(function() {

                                                            try {
                                                                //-- Flag that the Core Variables have been configured --//
                                                                IOMy.common.CoreVariablesInitialised = true;
                                                                //-- Reset the Navigation array and index after switching users --//
                                                                IOMy.common.NavPagesNavigationArray = [];
                                                                IOMy.common.NavPagesCurrentIndex = -1;
                                                                //-- LOAD THE 1ST Page --//
                                                                IOMy.common.NavigationChangePage( IOMy.common.sNavigationDefaultPage, {}, true);

                                                            } catch(e654321) {
                                                                //-- ERROR:  TODO: Write a better error message--//
                                                                jQuery.sap.log.error(">>>>Critical Error Loading \"Navigation Main\" page<<<<\n"+e654321.message);
                                                            }
                                                        }, me)
                                                    }); //-- END IO LIST --//
                                                    
                                                }
                                            }); //-- END LINK TYPES LIST --//

                                        }, me)
                                    }); //-- END LINK LIST --//

                                }, me)
                            }); //-- END ROOMS LIST --//
                            
                        }, me)
                    }); //-- END HUB LIST --//
                    
				}
			}); //-- END PREMISE LIST --//
		} catch(e1) {
			jQuery.sap.log.error("RefreshCoreVariables Error! "+e1.message);
		}
	},
	
	//================================================================//
	//== PREMISE LIST   											==//
	//================================================================//
	RefreshPremiseList : function (oConfig) {
		var me = this;
		
		IOMy.apiodata.AjaxRequest({
			Url : IOMy.apiodata.ODataLocation("premises"),
			Columns : [
                "PREMISE_PK", "PREMISE_NAME", "PREMISE_DESCRIPTION", "PERMISSIONS_WRITE", "PERMISSIONS_OWNER",
                "PREMISEFLOORS_PK", "PREMISEROOMS_PK", "PREMISEBEDROOMS_PK", "PREMISEOCCUPANTS_PK",
                "PREMISEFLOORS_NAME", "PREMISEROOMS_NAME", "PREMISEBEDROOMS_COUNT", "PREMISEOCCUPANTS_NAME"
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
						"PermWrite" : data[i].PERMISSIONS_WRITE,
						"PermOwner" : data[i].PERMISSIONS_OWNER,
                        "FloorCountId" : data[i].PREMISEFLOORS_PK,
                        "RoomCountId" : data[i].PREMISEROOMS_PK,
                        "BedroomCountId" : data[i].PREMISEBEDROOMS_PK,
                        "OccupantCountId" : data[i].PREMISEOCCUPANTS_PK,
                        "FloorCount" : data[i].PREMISEFLOORS_NAME,
                        "RoomCount" : data[i].PREMISEROOMS_NAME,
                        "BedroomCount" : data[i].PREMISEBEDROOMS_COUNT,
                        "OccupantCount" : data[i].PREMISEOCCUPANTS_NAME
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
				"PERMISSIONS_READ",
				"PERMISSIONS_WRITE",
				"PERMISSIONS_STATETOGGLE",
				"PERMISSIONS_OWNER",
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
						"PermRead":					aData[i].PERMISSIONS_READ,
						"PermWrite":				aData[i].PERMISSIONS_WRITE,
						"PermOwner":				aData[i].PERMISSIONS_OWNER,
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
				console.log(JSON.stringify(me.HubList));
				//-- Perform the "onSuccess" function if applicable --//
				if(oConfig.onSuccess) {
					oConfig.onSuccess();
				}
			},
			
			onFail : function (response) {
				jQuery.sap.log.error("Error refreshing gateway list: "+JSON.stringify(response));
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
		var aColumns		= [ "PREMISE_PK", "PREMISE_NAME", "ROOMS_PK", "ROOMS_NAME", "ROOMS_DESC", "ROOMS_FLOOR", "ROOMTYPE_PK", "ROOMTYPE_NAME", "ROOMTYPE_OUTDOORS" ];
		var aWhere			= [];
		var aOrderBy		= [ "PREMISE_PK", "ROOMTYPE_OUTDOORS", "ROOMS_PK" ];
		
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
				console.log("Login_RoomLookup Error!");
			},
		
			//--------------------------------//
			//-- 3.B - ON AJAX SUCCESS		--//
			//--------------------------------//
			onSuccess : $.proxy(function(sReturnDataType, AjaxData) {
				try {
					
					var iPremiseId		= 0;			//-- INTEGER:	--//
					var iRoomId			= 0;			//-- INTEGER:	--//
					var aTemp			= {};			//-- ARRAY:		Temporary Associative array used to temporarily store a utility price --//
					
					//--------------------------------------------------------//
					//-- 3.B.A - Check to see how many Tariffs are found	--//
					//--------------------------------------------------------//
					if( AjaxData.length >= 1 ) {
						//--------------------------------------------------------//
						//-- 3.B.A.1 - Store the Data in the Rooms List			--//
						//--------------------------------------------------------//
						for (var i = 0; i < AjaxData.length; i++) {
							
							iPremiseId		= parseInt( AjaxData[i].PREMISE_PK );
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
								aTemp.PremiseName			= AjaxData[i].PREMISE_NAME;
								
								aTemp.RoomId				= iRoomId;
								aTemp.RoomName				= AjaxData[i].ROOMS_NAME;
								aTemp.RoomDesc				= AjaxData[i].ROOMS_DESC;
								aTemp.RoomFloor				= AjaxData[i].ROOMS_FLOOR;
								aTemp.RoomTypeId			= parseInt( AjaxData[i].ROOMTYPE_PK );
								aTemp.RoomTypeName			= AjaxData[i].ROOMTYPE_NAME;
								aTemp.RoomTypeOutdoors		= parseInt( AjaxData[i].ROOMTYPE_OUTDOORS );
								
								
								//-- Array to store the IOs and IOPorts in --//
								aTemp.Things				= {};
								
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
					
				}
			})
		});
	},
	//============================================================//
	//== DEVICE IN DEVICE LIST									==//
	//============================================================//
	ThingInThingList: function( iTempThingId ) {
		
		
		var me				= this;				//-- SCOPE:			--//
		var bFoundThing	= false;			//-- BOOLEAN:		--//
		var sThingIndex	= "";				//-- STRING:	Most likely an integer under ideal conditions --//
		var aReturn			= {};				//-- ARRAY:		An array used to return the results	--//
		
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
	//== Search the Thing List for a IO							==//
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
