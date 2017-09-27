/*
Title: App loader
Author: Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
Modified: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: 
Copyright: Capsicum Corporation 2017
*/

//================================================//
//== 1.0 - CAPSICUM LOAD JS MODULES				==//
//================================================//
$.sap.registerModulePath('IomyRe.apiphp', sModuleInitialBuildLocation+'libraries/apiphp');
$.sap.require("IomyRe.apiphp");

$.sap.registerModulePath('IomyRe.apiodata', sModuleInitialBuildLocation+'libraries/apiodata');
$.sap.require("IomyRe.apiodata");

$.sap.registerModulePath('IomyRe.common', sModuleInitialBuildLocation+'libraries/common');
$.sap.require("IomyRe.common");

$.sap.registerModulePath('IomyRe.navigation', sModuleInitialBuildLocation+'libraries/navigation');
$.sap.require("IomyRe.navigation");

$.sap.registerModulePath('IomyRe.devices', sModuleInitialBuildLocation+'libraries/devices');
$.sap.require("IomyRe.devices");

$.sap.registerModulePath('IomyRe.functions', sModuleInitialBuildLocation+'libraries/functions');
$.sap.require("IomyRe.functions");
$.sap.require("IomyRe.functions.getNewDeviceOptions");

$.sap.registerModulePath('IomyRe.widgets', sModuleInitialBuildLocation+'libraries/widgets');
$.sap.require("IomyRe.widgets");

$.sap.registerModulePath('IomyRe.forms', sModuleInitialBuildLocation+'libraries/forms');
$.sap.require("IomyRe.forms");

$.sap.registerModulePath('IomyRe.pages', sModuleInitialBuildLocation+'libraries/pages');
$.sap.require("IomyRe.pages");

$.sap.registerModulePath('IomyRe.telnet', sModuleInitialBuildLocation+'libraries/telnet');
$.sap.require("IomyRe.telnet");

$.sap.registerModulePath('IomyRe.rules', sModuleInitialBuildLocation+'libraries/rules');
$.sap.require("IomyRe.rules");

$.sap.registerModulePath('IomyRe.validation', sModuleInitialBuildLocation+'libraries/validation');
$.sap.require("IomyRe.validation");


//================================================//
//== 2.0 - INITIALISE APPLICATION				==//
//================================================//
//sap.ui.localResources("pages", sLocalResources);
var sLocalResources = sModuleInitialBuildLocation+"pages";
jQuery.sap.registerResourcePath("pages", sLocalResources);

//Sets up the fragements location
jQuery.sap.registerResourcePath("fragments", sModuleInitialBuildLocation+"fragments");

// TODO: Perhaps use the user's language settings instead of that of the webview.
var language = navigator.language;
var oApp = new sap.m.App("oApp");
	
//----------------------------------------//
//-- 2.1 - Custom Transitions         --//
//----------------------------------------//
try {
	oApp.addCustomTransition( 
		"c_SlideBack", 
		sap.m.NavContainer.transitions.slide.back,
		sap.m.NavContainer.transitions.slide.to
	);
} catch( e1 ) {
	console.log("Error with Custom Transition");
}


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
		"Location":		"pages.staging.Tile",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.Tile\" Page!\n"
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
		"Id":			"pUserForm",
		"Location":		"pages.staging.user.UserForm",
		"Type":			"JS",
		"ErrMesg":		"Critical Error: Couldn't load \"pages.staging.user.UserForm\" Page!\n"
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

];

/**
 * Add each page declared in aPages using the map of variables for the page ID,
 * view name and its corresponding controller name, language type (in this it is
 * JS (JavaScript), and also the error message that will be displayed if an error
 * occurs in either its UI5 view or controller.
 */
//$.each( aPages, function (iIndex, aPageData) {
//	try {
//		//--------------------------------//
//		//-- 1.0 - Declare variables	--//
//		//--------------------------------//
//		var sType			= "";
//		var sErMesg			= aPageData.ErrMesg;
//		
//		//--------------------------------//
//		//--
//		//--------------------------------//
//		switch(aPageData.Type) {
//			case "JS":
//				sType =		sap.ui.core.mvc.ViewType.JS;
//				break;
//			
//			case "XML":
//				sType =		sap.ui.core.mvc.ViewType.XML;
//				break;
//			
//		}
//		
//        oApp.addPage(
//			new sap.ui.view({
//				id:			aPageData.Id,
//				viewName:	aPageData.Location,
//				type:		sType
//			})
//		);
//
//	} catch(ePLogin) {
//        jQuery.sap.log.error( sErMesg+ePLogin.message );
//	}
//});

IomyRe.pages.createPage("pLogin");

//================================================//
//== 5.4 - DEPLOY OPENUI5 APP					==//
//================================================//

//-- Deploy that App in the Content Div --//
oApp.placeAt("content");


