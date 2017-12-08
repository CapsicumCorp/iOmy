/*
Title: iOmy Navigation Functions
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: Functions for the Toolpage navigation.
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


$.sap.declare("IomyRe.navigation",true);

IomyRe.navigation = new sap.ui.base.Object();

$.extend( IomyRe.navigation, {
	
	onSideNavButtonPress : function(event, oView) {
		try {
			var oToolPage = oView.byId("toolPage");
			var sideExpanded = oToolPage.getSideExpanded();

			this._setToggleButtonTooltip(sideExpanded, oView);

			oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
			
		} catch(e1) {
			$.sap.log.error(" onSideNavButtonPress: Critical Error "+e1.message);
			return false;
		}
	},
	
	_setToggleButtonTooltip : function(bLarge, oView) {
		try {
			var toggleButton = oView.byId('sideNavigationToggleButton');
			
			if (bLarge) {
				toggleButton.setTooltip('Large Size Navigation');
			} else {
				toggleButton.setTooltip('Small Size Navigation');
			}
		} catch(e1) {
			$.sap.log.error(" _setToggleButtonTooltip: Critical Error "+e1.message);
			return false;	
		}
	},
	
	AddMenu: function (event, oView) {
		try {
			var oActionSheet3 = new sap.m.ActionSheet(oView.createId("userMessageActionSheet"), {
				buttons : [
					new sap.m.Button ({
						text: "Add Device",
						type: sap.m.ButtonType.Transparent,
						press : function () {
							IomyRe.common.NavigationChangePage( "pDeviceForm" , {} , false);
						}
					}),	
					new sap.m.Button ({
						text: "Add Room",
						type: sap.m.ButtonType.Transparent,
						press : function () {
							IomyRe.common.NavigationChangePage( "pRoomForm" ,  {"bEditing": false} , false);
						}
					}),
					new sap.m.Button ({
						text: "Add Rule",
						type: sap.m.ButtonType.Transparent,
						press : function () {
							IomyRe.common.NavigationChangePage( "pRulesForm" ,  {"bEditing": false} , false);
						}
					}),
					new sap.m.Button ({
						text: "Add User",
						type: sap.m.ButtonType.Transparent,
						press : function () {
							IomyRe.common.NavigationChangePage( "pNewUser" , {} , false);
						}
					}),
				],
				afterClose: function () {
					oActionSheet3.destroy();
				}
			}).addStyleClass('');
			
			oActionSheet3.openBy(event.getSource());
			
		} catch(e1) {
			$.sap.log.error(" AddMenu: Critical Error "+e1.message);
			return false;	
		}
	},
	
	GroupMenu: function (event, oView) {
		try {
			var oActionSheet4 = new sap.m.ActionSheet(oView.createId("userMessageActionSheet"), {
				buttons : [
					new sap.m.Button ({
						text: "Smart Plugs",
						type: sap.m.ButtonType.Transparent,
					}),	
					new sap.m.Button ({
						text: "Lights",
						type: sap.m.ButtonType.Transparent,
					}),
					new sap.m.Button ({
						text: "Cameras",
						type: sap.m.ButtonType.Transparent,
					}),
				],
				afterClose: function () {
					oActionSheet4.destroy();
				}
			}).addStyleClass('');
			
			oActionSheet4.openBy(event.getSource());
			
		} catch(e1) {
			$.sap.log.error(" GroupMenu: Critical Error "+e1.message);
			return false;	
		}
	},	
	
	EditMenu: function (event, oView) {
		try {
			var oActionSheet2 = new sap.m.ActionSheet(oView.createId("userMessageActionSheet"), {
				buttons : [
					new sap.m.Button ({
						text: "Edit Device",
						type: sap.m.ButtonType.Transparent,
						press : function () {
                            if (oApp.getCurrentPage().getId() === "pDevice") {
                                oApp.getCurrentPage().getController().bEditing = true;
                                oApp.getCurrentPage().getController().IndicateWhetherInEditModeOrNot();
                                
                            }
                            
                            IomyRe.common.NavigationChangePage( "pDevice" , {"bEditing": true} , true);
						}
					}),	
					new sap.m.Button ({
						text: "Edit Premise",
						type: sap.m.ButtonType.Transparent,
						press : function () {
							IomyRe.common.NavigationChangePage( "pPremiseForm" , {"PremiseId" : 1} , true);
						}
					}),
					new sap.m.Button ({
						text: "Edit Room",
						type: sap.m.ButtonType.Transparent,
						press : function () {
                            if (oApp.getCurrentPage().getId() === "pRoomList") {
                                oApp.getCurrentPage().getController().bEditing = true;
                                oApp.getCurrentPage().getController().IndicateWhetherInEditModeOrNot();
                                
                            }
                            
							IomyRe.common.NavigationChangePage( "pRoomList" ,  {"bEditing": true} , true);
						}
					}),
					new sap.m.Button ({
						text: "Edit Rule",
						type: sap.m.ButtonType.Transparent,
						press : function () {
							IomyRe.common.NavigationChangePage( "pRulesForm" ,  {"bEditing": true} , true);
						}
					}),
					new sap.m.Button ({
						text: "Edit User",
						type: sap.m.ButtonType.Transparent,
						press : function () {
							IomyRe.common.NavigationChangePage( "pUserList" , {} , true);
						}
					}),
				],
				afterClose: function () {
					oActionSheet2.destroy();
				}
			}).addStyleClass('');

			oActionSheet2.openBy(event.getSource());
			
		} catch(e1) {
			$.sap.log.error(" EditMenu: Critical Error "+e1.message);
			return false;	
		}
	},
	
	UserMenu: function (event, oView) {
		try {
			var oActionSheet = new sap.m.ActionSheet(oView.createId("userMessageActionSheet"), {
				buttons: [
					new sap.m.Button({
						text: 'User Settings',
						type: sap.m.ButtonType.Transparent,
						press : function () {
							IomyRe.common.NavigationChangePage( "pUserSettings" , {} , false);
						}
					}),
					new sap.m.Button({
						text: 'Help',
						type: sap.m.ButtonType.Transparent,
					}),
					new sap.m.Button({
						text: 'Logout',
						type: sap.m.ButtonType.Transparent,
						press : function () {
                            IomyRe.common.Logout();
						}
					})
				],
				afterClose: function () {
					oActionSheet.destroy();
				}
			});
			
			oActionSheet.openBy(event.getSource());
			
		} catch(e1) {
			$.sap.log.error(" UserMenu: Critical Error "+e1.message);
			return false;	
		}			
	}
});