/*
Title: App loader
Author: Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
Modified: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
    Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: 
Copyright: Capsicum Corporation 2017
*/

//================================================//
//== 1.0 - CAPSICUM LOAD JS MODULES				==//
//================================================//
$.sap.registerModulePath('iomy.apiphp', sModuleInitialBuildLocation+'libraries/apiphp');
$.sap.require("iomy.apiphp");

$.sap.registerModulePath('iomy.apiodata', sModuleInitialBuildLocation+'libraries/apiodata');
$.sap.require("iomy.apiodata");

$.sap.registerModulePath('iomy.common', sModuleInitialBuildLocation+'libraries/common');
$.sap.require("iomy.common");

$.sap.registerModulePath('iomy.navigation', sModuleInitialBuildLocation+'libraries/navigation');
$.sap.require("iomy.navigation");

$.sap.registerModulePath('iomy.devices', sModuleInitialBuildLocation+'libraries/devices');
$.sap.require("iomy.devices");

$.sap.registerModulePath('iomy.functions', sModuleInitialBuildLocation+'libraries/functions');
$.sap.require("iomy.functions");

$.sap.registerModulePath('iomy.widgets', sModuleInitialBuildLocation+'libraries/widgets');
$.sap.require("iomy.widgets");

$.sap.registerModulePath('iomy.forms', sModuleInitialBuildLocation+'libraries/forms');
$.sap.require("iomy.forms");

$.sap.registerModulePath('iomy.pages', sModuleInitialBuildLocation+'libraries/pages');
$.sap.require("iomy.pages");

$.sap.registerModulePath('iomy.telnet', sModuleInitialBuildLocation+'libraries/telnet');
$.sap.require("iomy.telnet");

$.sap.registerModulePath('iomy.help', sModuleInitialBuildLocation+'libraries/help');
$.sap.require("iomy.help");

$.sap.registerModulePath('iomy.time', sModuleInitialBuildLocation+'libraries/time');
$.sap.require("iomy.time");

$.sap.registerModulePath('iomy.rules', sModuleInitialBuildLocation+'libraries/rules');
$.sap.require("iomy.rules");

$.sap.registerModulePath('iomy.validation', sModuleInitialBuildLocation+'libraries/validation');
$.sap.require("iomy.validation");

//----------------------------------------//
//-- 1.2 - Optional Libraries           --//
//----------------------------------------//
$.sap.registerModulePath('iomy.graph_jqplot', sModuleInitialBuildLocation+'libraries/graph_jqplot');




//================================================//
//== 2.0 - INITIALISE APPLICATION				==//
//================================================//
//sap.ui.localResources("pages", sLocalResources);
var sLocalResources = sModuleInitialBuildLocation+"pages";
jQuery.sap.registerResourcePath("pages", sLocalResources);

//Sets up the fragements location
jQuery.sap.registerResourcePath("fragments", sModuleInitialBuildLocation+"fragments");

// TODO: Use the user's language settings instead of that of the webview.
var language = navigator.language;
var oApp = new sap.m.App("oApp");
	
//----------------------------------------//
//-- 2.1 - Custom Transitions         --//
//----------------------------------------//
//try {
//	oApp.addCustomTransition( 
//		"c_SlideBack", 
//		sap.m.NavContainer.transitions.slide.back,
//		sap.m.NavContainer.transitions.slide.to
//	);
//} catch( e1 ) {
//	$.sap.log.error("Error with Custom Transition.");
//}


//================================================//
//== 3.0 - PAGES								==//
//================================================//
//-- NOTE: The first page added is the one that will be displayed on first run --//

var aPages = [
	{
		"Id":			"pLogin",
		"Location":		"pages.Login",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.Login\" Page!\n"
	},
	{
		"Id":			"pDevice",
		"Location":		"pages.Device",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.Device\" Page!\n"
	},
	{
		"Id":			"pHome",
		"Location":		"pages.Home",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.Home\" Page!\n"
	},
	{
		"Id":			"pUserSettings",
		"Location":		"pages.user.UserSettings",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.UserSettings\" Page!\n"
	},
	{
		"Id":			"pTile",
		"Location":		"pages.device.IOTiles",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.device.IOTiles\" Page!\n"
	},
	{
		"Id":			"pPremise",
		"Location":		"pages.Premise",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.Premise\" Page!\n"
	},
	{
		"Id":			"pRoomList",
		"Location":		"pages.Room",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.Room\" Page!\n"
	},
	{
		"Id":			"pRGBlight",
		"Location":		"pages.device.RGBlight",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.device.RGBlight\" Page!\n"
	},
	{
		"Id":			"pMJPEG",
		"Location":		"pages.device.Mjpeg",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.device.Mjpeg\" Page!\n"
	},
	{
		"Id":			"pOnvifSnapshot",
		"Location":		"pages.device.OnvifCamera",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.device.OnvifCamera\" Page!\n"
	},
	{
		"Id":			"pUserForm",
		"Location":		"pages.user.UserForm",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.user.UserForm\" Page!\n"
	},
	{
		"Id":			"pNewUser",
		"Location":		"pages.user.NewUser",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.user.NewUser\" Page!\n"
	},
	{
		"Id":			"pUserList",
		"Location":		"pages.user.UserList",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.user.UserList\" Page!\n"
	},
	{
		"Id":			"pDeviceForm",
		"Location":		"pages.device.DeviceForm",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.device.DeviceForm\" Page!\n"
	},
	{
		"Id":			"pPremiseForm",
		"Location":		"pages.premise.PremiseForm",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.premise.PremiseForm\" Page!\n"
	},
	{
		"Id":			"pWeatherFeed",
		"Location":		"pages.device.WeatherFeed",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.device.WeatherFeed\" Page!\n"
	},
	{
		"Id":			"pMotionSensor",
		"Location":		"pages.device.MotionSensor",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.device.MotionSensor\" Page!\n"
	},
	
	{
		"Id":			"pRulesList",
		"Location":		"pages.RulesList",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.RulesList\" Page!\n"
	},
	{
		"Id":			"pTelnet",
		"Location":		"pages.telnet.Telnet",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.telnet.Telnet\" Page!\n"
	},
    
	{
		"Id":			"pGraphLine",
		"Location":		"pages.graphs.LineGraph",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.graphs.LineGraph\" Page!\n"
	},
	{
		"Id":			"pGraphBar",
		"Location":		"pages.graphs.BarGraph",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.graphs.BarGraph\" Page!\n"
	},
	{
		"Id":			"pGraphPie",
		"Location":		"pages.graphs.PieGraph",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.graphs.PieGraph\" Page!\n"
	},
    //-- Room Form --//
	{
		"Id":			"pAddRoomForm",
		"Location":		"pages.room.RoomForm",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.room.RoomForm\" Page!\n"
	},
	{
		"Id":			"pEditRoomForm",
		"Location":		"pages.room.RoomForm",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.room.RoomForm\" Page!\n"
	},
    
	{
		"Id":			"pRulesForm",
		"Location":		"pages.rules.RulesForm",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.rules.RulesForm\" Page!\n"
	},
	{
		"Id":			"pFFMPEG",
		"Location":		"pages.FFMPEG",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.FFMPEG\" Page!\n"
	},
	{
		"Id":			"pServerInfo",
		"Location":		"pages.Development.ServerInfo",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.Development.ServerInfo\" Page!\n"
	},
	{
		"Id":			"pDBIndex",
		"Location":		"pages.Development.DBIndex",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.Development.DBIndex\" Page!\n"
	},
	{
		"Id":			"pAdvanced",
		"Location":		"pages.Development.Advanced",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.Development.Advanced\" Page!\n"
	},
	{
		"Id":			"pManagedStreams",
		"Location":		"pages.Development.ManagedStreams",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.Development.ManagedStreams\" Page!\n"
	},
	{
		"Id":			"pAddStream",
		"Location":		"pages.Development.AddStream",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.Development.AddStream\" Page!\n"
	}

];


iomy.pages.createPage("pLogin");

//================================================//
//== 5.4 - DEPLOY OPENUI5 APP					==//
//================================================//

//-- Deploy that App in the Content Div --//
oApp.placeAt("content");


