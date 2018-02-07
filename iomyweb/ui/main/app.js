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
		"Location":		"pages.staging.Login",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.Login\" Page!\n"
	},
	{
		"Id":			"pDevice",
		"Location":		"pages.staging.Device",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.Device\" Page!\n"
	},
	{
		"Id":			"pBlock",
		"Location":		"pages.staging.Block",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.Block\" Page!\n"
	},
	{
		"Id":			"pUserSettings",
		"Location":		"pages.staging.user.UserSettings",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.UserSettings\" Page!\n"
	},
	{
		"Id":			"pTile",
		"Location":		"pages.staging.device.IOTiles",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.device.IOTiles\" Page!\n"
	},
	{
		"Id":			"pPremise",
		"Location":		"pages.staging.Premise",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.Premise\" Page!\n"
	},
	{
		"Id":			"pRoomList",
		"Location":		"pages.staging.Room",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.Room\" Page!\n"
	},
	{
		"Id":			"pRGBlight",
		"Location":		"pages.staging.device.RGBlight",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.device.RGBlight\" Page!\n"
	},
	{
		"Id":			"pMJPEG",
		"Location":		"pages.staging.device.Mjpeg",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.device.Mjpeg\" Page!\n"
	},
	{
		"Id":			"pOnvifSnapshot",
		"Location":		"pages.staging.device.OnvifCamera",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.device.OnvifCamera\" Page!\n"
	},
	{
		"Id":			"pUserForm",
		"Location":		"pages.staging.user.UserForm",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.user.UserForm\" Page!\n"
	},
	{
		"Id":			"pNewUser",
		"Location":		"pages.staging.user.NewUser",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.user.NewUser\" Page!\n"
	},
	{
		"Id":			"pUserList",
		"Location":		"pages.staging.user.UserList",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.user.UserList\" Page!\n"
	},
	{
		"Id":			"pDeviceForm",
		"Location":		"pages.staging.device.DeviceForm",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.device.DeviceForm\" Page!\n"
	},
	{
		"Id":			"pPremiseForm",
		"Location":		"pages.staging.premise.PremiseForm",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.premise.PremiseForm\" Page!\n"
	},
	{
		"Id":			"pWeatherFeed",
		"Location":		"pages.staging.device.WeatherFeed",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.device.WeatherFeed\" Page!\n"
	},
	{
		"Id":			"pMotionSensor",
		"Location":		"pages.staging.device.MotionSensor",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.device.MotionSensor\" Page!\n"
	},
	
	{
		"Id":			"pRulesList",
		"Location":		"pages.staging.RulesList",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.RulesList\" Page!\n"
	},
	{
		"Id":			"pTelnet",
		"Location":		"pages.staging.telnet.Telnet",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.telnet.Telnet\" Page!\n"
	},
    
	{
		"Id":			"pGraphLine",
		"Location":		"pages.staging.graphs.LineGraph",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.graphs.LineGraph\" Page!\n"
	},
	{
		"Id":			"pGraphBar",
		"Location":		"pages.staging.graphs.BarGraph",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.graphs.BarGraph\" Page!\n"
	},
	{
		"Id":			"pGraphPie",
		"Location":		"pages.staging.graphs.PieGraph",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.graphs.PieGraph\" Page!\n"
	},
	{
		"Id":			"pRoomForm",
		"Location":		"pages.staging.room.RoomForm",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.room.RoomForm\" Page!\n"
	},
	{
		"Id":			"pRulesForm",
		"Location":		"pages.staging.rules.RulesForm",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.rules.RulesForm\" Page!\n"
	},
	{
		"Id":			"pFFMPEG",
		"Location":		"pages.staging.FFMPEG",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.FFMPEG\" Page!\n"
	},
	{
		"Id":			"pServerInfo",
		"Location":		"pages.staging.Development.ServerInfo",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.Development.ServerInfo\" Page!\n"
	},
	{
		"Id":			"pDBIndex",
		"Location":		"pages.staging.Development.DBIndex",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.Development.DBIndex\" Page!\n"
	}

];


iomy.pages.createPage("pLogin");

//================================================//
//== 5.4 - DEPLOY OPENUI5 APP					==//
//================================================//

//-- Deploy that App in the Content Div --//
oApp.placeAt("content");


