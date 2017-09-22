/*
Title: Navigation Menu UI fragment
Author: Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
Modified: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Builds the navigation menu.
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
							text:		IOMy.common.UserDisplayName,
							expanded:	true,
							items:	[],
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
									text: "New Device",
									select:	function (oControlEvent) {
										IOMy.common.NavigationChangePage( "pSettingsLinkAdd", {}, true );
									}
								}),
								new sap.tnt.NavigationListItem({
									text: "Device List",
									select:	function (oControlEvent) {
										IOMy.common.NavigationChangePage( "pSettingsDeviceList", {}, true );
									}
								}),
								new sap.tnt.NavigationListItem({
									text: "Telnet",
									select:	function (oControlEvent) {
										IOMy.common.NavigationChangePage( "pTelnetPage", {}, true );
									}
								}),
								//--------------------------------//
								//-- EDIT USER PAGES			--//
								//--------------------------------//
								new sap.tnt.NavigationListItem({
									text: "Edit User Information",
									select:	function (oControlEvent) {
										IOMy.common.NavigationChangePage( "pSettingsUserInfo", {}, true );
									}
								}),
								new sap.tnt.NavigationListItem({
									text: "Edit User Address",
									select:	function (oControlEvent) {
										IOMy.common.NavigationChangePage( "pSettingsUserAddress", {}, true );
									}
								}),
								new sap.tnt.NavigationListItem({
									text: "Change Password",
									select:	function (oControlEvent) {
										IOMy.common.NavigationChangePage( "pSettingsUserPassword", {}, true );
									}
								}),
								new sap.tnt.NavigationListItem({
									text: "New User",
									select:	function (oControlEvent) {
										IOMy.common.NavigationChangePage( "pSettingsAddUser", {}, true );
									}
								}),
								//--------------------------------//
								//-- PERMISSIONS    			--//
								//--------------------------------//
								new sap.tnt.NavigationListItem({
									text: "Room Permissions",
									select:	function (oControlEvent) {
										IOMy.common.NavigationChangePage( "pSettingsRoomPermissions", {}, true );
									}
								}),
								new sap.tnt.NavigationListItem({
									text: "Premise Permissions",
									select:	function (oControlEvent) {
										IOMy.common.NavigationChangePage( "pSettingsPremisePermissions", {}, true );
									}
								}),
								//--------------------------------//
								//-- RULE DEVICE LIST           --//
								//--------------------------------//
								new sap.tnt.NavigationListItem({
									text: "Rules",
									select:	function (oControlEvent) {
										IOMy.common.NavigationChangePage( "pRuleDeviceList", {}, true );
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
						//-- SIGN OUT   				--//
						//--------------------------------//
                        new sap.tnt.NavigationListItem({
							icon: "sap-icon://GoogleMaterial/person",
							text: "Sign Out",
							select:	function (oControlEvent) {
								//-------------------------------------------//
                                // Ask if the user actually meant to hit sign
                                // out in the menu.
								//-------------------------------------------//
                                IOMy.common.showConfirmQuestion("Are you sure you want to sign out of iOmy?", "Sign Out",
                                    // Callback function to run when a selection is made
                                    function (oAction) {
                                        //------------------------------------------------------//
                                        // Determine which button was pressed. If YES, proceed
                                        //------------------------------------------------------//
                                        if (oAction === sap.m.MessageBox.Action.OK) {
                                            //------------------------------------------------------//
                                            // Declare the necessary variables
                                            //------------------------------------------------------//
                                            var sUrl = IOMy.apiphp.APILocation("sessioncheck");

                                            //------------------------------------------------------//
                                            // Sign the user out
                                            //------------------------------------------------------//
                                            IOMy.apiphp.AjaxRequest({
                                                "url" : sUrl,
                                                "data" : {
                                                    "username" : "",
                                                    "password" : "",
                                                    "AttemptLogin" : 1
                                                },

                                                "onSuccess" : function (response, data) {
                                                    this.onComplete();
                                                },

                                                "onFail" : function (response) {
                                                    jQuery.sap.log.error(response.ErrCode + ": " + response.ErrMesg);
                                                    this.onComplete();
                                                },

                                                "onComplete" : function() {
                                                    window.location.reload(true); // TRUE forces a full refresh from the server, NOT the cache!
                                                }
                                            });
                                        }
                                    }
                                );
							}
						}),
						//--------------------------------//
						//-- SWITCH USER				--//
						//--------------------------------//
//						new sap.tnt.NavigationListItem({
//							icon: "sap-icon://GoogleMaterial/person",
//							text: "Switch User",
//							select:	function (oControlEvent) {
//								IOMy.common.NavigationChangePage( "pForceSwitchUser", {}, true );
//							}
//						}),
						//--------------------------------//
						//-- UI Staging      			--//
						//--------------------------------//
//						new sap.tnt.NavigationListItem({
//							text: "UI Staging",
//							select:	function (oControlEvent) {
//								IOMy.common.NavigationChangePage( "pStagingHome", {}, true );
//							}
//						})
					]
				}).addStyleClass("IOMYNavMenu")
			]
		}).addStyleClass("IOMYNavMenuContainer");
		
		//--------------------------------//
		//-- RETURN THE NAV POPUP		--//
		//--------------------------------//
		return oNavPopup;
	}
	
});