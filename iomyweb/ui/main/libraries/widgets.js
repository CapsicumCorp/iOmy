/*
Title: IOMy Page Widgets
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: A function to create a complete sap.m.Page for all activities
    (pages).
Copyright: Capsicum Corporation 2016, 2017

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

$.sap.declare("IomyRe.widgets",true);

IomyRe.widgets = new sap.ui.base.Object();

$.extend( IomyRe.widgets, {
	
	//-- Top Navigation for all pages --//
	getToolPageHeader : function (oCurrentController) {
	
		//----------------------------------------------------//
		//-- 1.0 - Initialise                               --//
		//----------------------------------------------------//
		
		var oNavButton;					//-- OBJECT:	Stores the UI5 Button that holds the Toggle Navigation Button	--//
		var oToolbarSpacer1;			//-- OBJECT:	Stores the UI5 Toolbar Spacer									--//
		var oToolbarSpacer2;			//-- OBJECT:	Stores the UI5 Toolbar Spacer									--//
		var oLogo;						//-- OBJECT:	Stores the UI5 Image that holds the iOmy Logo					--//
		var oAdd;						//-- OBJECT:	Stores the UI5 Button that holds the Add Button / Menu			--//
		var oEdit;						//-- OBJECT:	Stores the UI5 Button that holds the Edit Button / Menu			--//
		var oSwitchView;				//-- OBJECT:	Stores the UI5 Button that holds the SwitchView Button / Menu	--//
		var oSettings;					//-- OBJECT:	Stores the UI5 Button that holds the Settings Button / Menu		--//
		var oToolHeader;				//-- OBJECT:	This variable stores the ToolPage header and is returned.		--//	

		var oView = oCurrentController.getView();  //-- Defines oView based on the Controller that's being passed --//
		
		//----------------------------------------------------//
		//-- 2.0 - Create ToolHeader Content                --//
		//----------------------------------------------------//
		
		oNavButton = new sap.m.Button (oView.createId("sideNavigationToggleButton"), {
			layoutData : new sap.m.OverflowToolbarLayoutData({
				priority : sap.m.OverflowToolbarPriority.NeverOverflow
			}),
			icon: "sap-icon://menu2",
			type: "Transparent",
			press: function(oControlEvent) {
				IomyRe.navigation.onSideNavButtonPress(oControlEvent, oView);
			}
		});
		
		oToolbarSpacer1 = new sap.m.ToolbarSpacer ({});
		
		oToolbarSpacer2 = new sap.m.ToolbarSpacer ({});
		
		oLogo = new sap.m.Image ({
			layoutData : new sap.m.OverflowToolbarLayoutData({
				priority : sap.m.OverflowToolbarPriority.NeverOverflow
			}),
			width: "70px",
			height: "40px",
			src: "resources/images/mini-logo.png"
		});
		
		oAdd = new sap.m.Button ({
			layoutData : new sap.m.OverflowToolbarLayoutData({
				priority : sap.m.OverflowToolbarPriority.NeverOverflow
			}),
			icon: "sap-icon://add",
			type: "Transparent",
			press: function(oControlEvent) {
				IomyRe.navigation.AddMenu(oControlEvent, oView);
			}	
		});
		
		oEdit = new sap.m.Button ({
			layoutData : new sap.m.OverflowToolbarLayoutData({
				priority : sap.m.OverflowToolbarPriority.NeverOverflow
			}),
			icon: "sap-icon://edit",
			type: "Transparent",
			press: function(oControlEvent) {
				IomyRe.navigation.EditMenu(oControlEvent, oView);
			}	
		});
		
		oSwitchView = new sap.m.Button ({
			layoutData : new sap.m.OverflowToolbarLayoutData({
				priority : sap.m.OverflowToolbarPriority.NeverOverflow
			}),
			icon: "sap-icon://switch-views",
			type: "Transparent",
			press: function(oControlEvent) {
				IomyRe.navigation.GroupMenu(oControlEvent, oView);
			}	
		});
		
		oSettings = new sap.m.Button (oView.createId("openMenu"), {
			text: "Hi, Freshwater1!",
			type: "Transparent",
			press: function(oControlEvent) {
				IomyRe.navigation.UserMenu(oControlEvent, oView);
			}	
		});
		
		//----------------------------------------------------//
		//-- 3.0 - Create the Tool Header itself    --//
		//----------------------------------------------------//
		oToolHeader = new sap.tnt.ToolHeader ({
			content : [
				oNavButton, oToolbarSpacer1, oLogo, oToolbarSpacer2, oAdd, oEdit, oSwitchView, oSettings
			]
		});
			
		//----------------------------------------------------//
		//-- 4.0 - Return the Results                       --//
		//----------------------------------------------------//		
		return oToolHeader;
	},
	
	
	//-- Side Navigation for all pages --//
	getToolPageSideContent : function (oCurrentController) {
	
		//----------------------------------------------------//
		//-- 1.0 - Initialise                               --//
		//----------------------------------------------------//
		
		var oToolSideNav;		//-- OBJECT:	This variable stores the ToolPage header and is returned.		--//
		var oNavHome;			//-- OBJECT:	Stores the UI5 List Item that holds the Home Select				--//
		var oNavDevices;		//-- OBJECT:	Stores the UI5 List Item that holds the Devices Select			--//
		var oNavPremise;		//-- OBJECT:	Stores the UI5 List Item that holds the Premise Select			--//
		var oNavRoom;			//-- OBJECT:	Stores the UI5 List Item that holds the Room Select				--//
		var oNavRules;			//-- OBJECT:	Stores the UI5 List Item that holds the Rules Select			--//
		var oNavUsers;			//-- OBJECT:	Stores the UI5 List Item that holds the Users Select			--//
		var oNavLinks;			//-- OBJECT:	Stores the UI5 List Item that holds the Important Links Select  --//
		var oNavLegal;			//-- OBJECT:	Stores the UI5 List Item that holds the Legal Select			--//
	
		//----------------------------------------------------//
		//-- 2.0 - Create ToolHeader Side Content           --//
		//----------------------------------------------------//
		
		oNavHome = new sap.tnt.NavigationListItem ({
			icon: "sap-icon://home",
			text: "Home",
			select : function () {
				IomyRe.common.NavigationChangePage( "pBlock" , {} , false);
			}
		});
		
		oNavDevices = new sap.tnt.NavigationListItem ({
			icon: "sap-icon://it-system",
			text: "Devices",
			select : function () {
				IomyRe.common.NavigationChangePage( "pDevice" , {} , false);
			}
		});
		
		oNavPremise = new sap.tnt.NavigationListItem ({
			icon: "sap-icon://building",
			text: "Premise",
			select : function () {
				IomyRe.common.NavigationChangePage( "pPremise" , {} , false);
			}
		});
		
		oNavRoom = new sap.tnt.NavigationListItem ({
			icon: "sap-icon://idea-wall",
			text: "Room",
			select : function () {
				IomyRe.common.NavigationChangePage( "pRoomList" , {} , false);
			}
		});
		
		oNavRules = new sap.tnt.NavigationListItem ({
			icon: "sap-icon://add-activity",
			text: "Rules",
			select : function () {
				IomyRe.common.NavigationChangePage( "pRuleList" , {} , false);
			}
		});
		
		oNavUsers = new sap.tnt.NavigationListItem ({
			icon: "sap-icon://family-protection",
			text: "Users",
			select : function () {
				IomyRe.common.NavigationChangePage( "pUserForm" , {} , false);
			}
		});
		
		oNavLinks = new sap.tnt.NavigationListItem ({
			icon: "sap-icon://chain-link",
			text: "Important Links",
			select : function () {
				IomyRe.common.NavigationChangePage( "pUserList" , {} , false);
			}
		});
		
		oNavLegal = new sap.tnt.NavigationListItem ({
			icon: "sap-icon://compare",
			text: "Legal Information",
			select : function () {
				IomyRe.common.NavigationChangePage( "pUserList" , {} , false);
			}
		});
		
		
		//----------------------------------------------------//
		//-- 3.0 - Create the Tool Side NavigationList      --//
		//----------------------------------------------------//
		oToolSideNav = new sap.tnt.SideNavigation ({
			expanded : true,
			item : new sap.tnt.NavigationList ({
				items : [
					oNavHome, oNavDevices, oNavPremise, oNavRoom, oNavRules, oNavUsers
				]
			}),
			fixedItem : new sap.tnt.NavigationList ({
				items : [
					oNavLinks, oNavLegal
				]
			}),
			footer : new sap.tnt.NavigationList ({
				items : [
					
				]
			})
		});
		
		//----------------------------------------------------//
		//-- 4.0 - Return the Results                       --//
		//----------------------------------------------------//	
		return oToolSideNav;
	},
	
	//-- CSR Button for the "Day Light Mode" button --//
	CSRbutton : function (oCurrentController) {
		//----------------------------------------------------//
		//-- 1.0 - Initialise                               --//
		//----------------------------------------------------//		
		
		var oView = oCurrentController.getView();  //-- Defines oView based on the Controller that's being passed --//
		var oDescLabel;
		var oWhiteLight;
		var oCSRHBox;
		
		//----------------------------------------------------//
		//-- 2.0 - Create the Hbox Content                  --//
		//----------------------------------------------------//
		oWhiteLight = new sap.m.Switch ({
			
		});
		
		oDescLabel = new sap.m.Label ({
			text: "Day Light Mode",
			
		});
		
		//----------------------------------------------------//
		//-- 3.0 - Fill the CSR HBox                        --//
		//----------------------------------------------------//
		oCSRHBox = new sap.m.VBox (oView.createId("WhiteLight_Cont"),{
			width: "71px",
			height: "100%",
			items : [
				oDescLabel, oWhiteLight
			]
		}).addStyleClass("ElementCenter");
		
		//----------------------------------------------------//
		//-- 4.0 - Return the Results                       --//
		//----------------------------------------------------//	
		
		return oCSRHBox;
		
	},
	
	
	//-- Scroll Container for the "RGB" colorpicker --//
	RGBContainer : function (oCurrentController) {
		var oScrollContainer;
		var oView = oCurrentController.getView();  //-- Defines oView based on the Controller that's being passed --//
		
		oScrollContainer = new sap.m.ScrollContainer (oView.createId("RGB_Cont"), {
			width: "100%",
			height: "100%",
			vertical : true,
			content : [
				new sap.ui.unified.ColorPicker (oView.createId("CPicker"), {
					mode: sap.ui.unified.ColorPickerMode.HSV							
				}).addStyleClass("ElementChildCenter PadTop2d0Rem")
			]
		});
		
		return oScrollContainer;
	},
	
	//-- Scroll Container for the "Mjpeg" image --//
	MJPEGCont : function (oCurrentController, sImgSRC) {
		var oScrollContainer;
		var oView = oCurrentController.getView();  //-- Defines oView based on the Controller that's being passed --//
		
		oScrollContainer = new sap.m.ScrollContainer (oView.createId("MJPEG_Cont"), {
			width: "100%",
			height: "100%",
			vertical : true,
			content : [
				new sap.m.Image (oView.createId("MJPEG_Img"), {
					width: "75%",
					height: "75%",
					src: sImgSRC
				}).addStyleClass("MarLeft14Per")
			]
		});
		
		return oScrollContainer;
	},
	
	//-- Provides the "Page" with a Title --//
	DeviceToolbar : function (oCurrentController, sDevName) {
		//----------------------------------------------------//
		//-- 1.0 - Initialise                               --//
		//----------------------------------------------------//	
		var oToolbar;
		var oDevTitle;
		var oTSpacer1;
		var oTspacer2;
		
		//----------------------------------------------------//
		//-- 2.0 - Create the Content                       --//
		//----------------------------------------------------//
		oDevTitle = new sap.m.Title ({
			text: sDevName
		});
		
		oTSpacer1 = new sap.m.ToolbarSpacer({});
		oTSpacer2 = new sap.m.ToolbarSpacer({});
		//----------------------------------------------------//
		//-- 3.0 - Fill the Toolbar                         --//
		//----------------------------------------------------//
		oToolbar = new sap.m.Toolbar ({
			content : [
				oTSpacer1, oDevTitle, oTSpacer2
			]
		});
		//----------------------------------------------------//
		//-- 4.0 - Return the Results                       --//
		//----------------------------------------------------//
		
		return oToolbar;
	},
	
	UserForm : function (oCurrentController, sPageSectionID, sSubSectionID, sFormID, bEditable, sSectionTitle) {
		//----------------------------------------------------//
		//-- 1.0 - Initialise                               --//
		//----------------------------------------------------//	
		var oView = oCurrentController.getView();  //-- Defines oView based on the Controller that's being passed --//
		var oPageSection;
		var oSubSection;
		
		//----------------------------------------------------//
		//-- 2.0 - Create the Content                       --//
		//----------------------------------------------------//
		oSubSection = new sap.uxap.ObjectPageSubSection(oView.createId(sSubSectionID), {
			blocks : [
				new sap.ui.layout.form.Form( oView.createId(sFormID),{
					editable: bEditable,
					layout : new sap.ui.layout.form.ResponsiveGridLayout ({
						labelSpanXL: 3,
						labelSpanL: 3,
						labelSpanM: 3,
						labelSpanS: 12,
						adjustLabelSpan: false,
						emptySpanXL: 3,
						emptySpanL: 2,
						emptySpanM: 0,
						emptySpanS: 0,
						columnsXL: 1,
						columnsL: 1,
						columnsM: 1,
						columnsS: 1,
						singleContainerFullSize: false
					}),
					toolbar : new sap.m.Toolbar({
						content : [
							new sap.m.Title ({
								text: sSectionTitle
							})
						]
					}).addStyleClass("MarBottom1d0Rem"),
					formContainers : [
					
					]
				})
			]
		});
		
		//----------------------------------------------------//
		//-- 3.0 - Fill the Page Section                    --//
		//----------------------------------------------------//
		oPageSection = new sap.uxap.ObjectPageSection(oView.createId(sPageSectionID), {
			visible: false,
			showTitle: false,
			title: sSectionTitle,
			subSections : [
				oSubSection
			]
		});
		
		//----------------------------------------------------//
		//-- 4.0 - Return the Results                       --//
		//----------------------------------------------------//
		return oPageSection;
	},
	
});