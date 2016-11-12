/*
Title: Navigation Menu UI fragment
Author: Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
Modified: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Builds the navigation menu.
Copyright: Capsicum Corporation 2016

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

sap.ui.jsfragment("mjs.fragments.NavMenu", {
	
	createContent: function( oController ) {
		//--------------------------------//
		//-- CREATE THE NAV CONTAINER	--//
		//--------------------------------//
		var oNavPopup = new sap.m.Popover({
			placement: sap.m.PlacementType.Bottom,
			showHeader : false,
			content: [
				new sap.tnt.NavigationList({
					items: [
						//--------------------------------//
						//-- USER ACCOUNT				--//
						//--------------------------------//
						new sap.tnt.NavigationListItem( oController.createId("UsernameButton"), {
							icon:		"sap-icon://GoogleMaterial/person",
							text:		"User Accounts",
							expanded:	false,
							items:	[
								//--------------------------------//
								//-- SWITCH USER				--//
								//--------------------------------//
								new sap.tnt.NavigationListItem({
									text: "Edit Information",
									select:	function (oControlEvent) {
										IOMy.common.NavigationChangePage( "pSettingsUserInfo", {}, true );
									}
								}),
								new sap.tnt.NavigationListItem({
									text: "Edit Address",
									select:	function (oControlEvent) {
										IOMy.common.NavigationChangePage( "pSettingsUserAddress", {}, true );
									}
								}),
								new sap.tnt.NavigationListItem({
									text: "Change Password",
									select:	function (oControlEvent) {
										IOMy.common.NavigationChangePage( "pSettingsUserPassword", {}, true );
									}
								})
							],
							select:		function (oControlEvent) {
								//---------------------------------------------------//
								//-- TOGGLE SELECTED STATUS IF MEDIA IS MOBILE     --//
								//---------------------------------------------------//
                                var mSystem = sap.ui.Device.system;
                                
                                if (mSystem.desktop === false) {
                                    if( this.getExpanded() ) {
                                        this.setExpanded(false);
                                    } else {
                                        this.setExpanded(true);
                                    }
                                }
							}
						}),
						//--------------------------------//
						//-- DEVICE OVERVIEW			--//
						//--------------------------------//
						new sap.tnt.NavigationListItem({
							icon:	"sap-icon://IOMy1/appliances",
							text:	"Device Overview",
							select:	function (oControlEvent) {
								IOMy.common.NavigationChangePage( "pDeviceOverview", {}, true );
							}
						}),
						
						//--------------------------------//
						//-- PREMISES OVERVIEW			--//
						//--------------------------------//
						new sap.tnt.NavigationListItem({
							icon:	"sap-icon://GoogleMaterial/home",
							text:	"Premises Overview",
							select:	function (oControlEvent) {
								IOMy.common.NavigationChangePage( "pPremiseOverview", {}, true );
							}
						}),
						
						//--------------------------------//
						//-- SETTINGS OVERVIEW			--//
						//--------------------------------//
						new sap.tnt.NavigationListItem({
							icon:		"sap-icon://GoogleMaterial/settings",
							text:		"Settings",
							expanded:	false,
							items:	[
								new sap.tnt.NavigationListItem({
									text: "Premise & Hub",
									select:	function (oControlEvent) {
										IOMy.common.NavigationChangePage( "pSettingsPremiseList", {}, true );
									}
								}),
								new sap.tnt.NavigationListItem({
									text: "Links and Items",
									select:	function (oControlEvent) {
										IOMy.common.NavigationChangePage( "pSettingsDeviceList", {}, true );
									}
								})
							],
							select:		function (oControlEvent) {
								//---------------------------------------------------//
								//-- TOGGLE SELECTED STATUS IF MEDIA IS MOBILE     --//
								//---------------------------------------------------//
                                var mSystem = sap.ui.Device.system;
                                
                                if (mSystem.desktop === false) {
                                    if( this.getExpanded() ) {
                                        this.setExpanded(false);
                                    } else {
                                        this.setExpanded(true);
                                    }
                                }
							}
						}),
						//--------------------------------//
						//-- SWITCH USER				--//
						//--------------------------------//
						new sap.tnt.NavigationListItem({
							icon: "sap-icon://GoogleMaterial/person",
							text: "Switch User",
							select:	function (oControlEvent) {
								IOMy.common.NavigationChangePage( "pForceSwitchUser", {}, true );
							}
						}),
					]
				}).addStyleClass("IOMYNavMenu")
			]
		}).addStyleClass("IOMYNavMenuContainer");
		
		//--------------------------------//
		//-- RETURN THE NAV POPUP		--//
		//--------------------------------//
        IOMy.functions.setCurrentUserNameForNavigation(oController);
		//--------------------------------//
		//-- RETURN THE NAV POPUP		--//
		//--------------------------------//
		return oNavPopup;
	}
	
});