/*
Title: Device List
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
	Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: 
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

sap.ui.controller("mjs.settings.DeviceList", {
	
	wPanel					: null,
	
	aElementsToDestroy		: [],
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.settings.DeviceList
*/

	onInit: function() {
		var me = this;			//-- SCOPE: Allows subfunctions to access the current scope --//
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			onBeforeShow : function (evt) {
				//----------------------------------------------------//
				//-- Enable/Disable Navigational Forward Button		--//
				//----------------------------------------------------//
				
				//-- Refresh the Navigational buttons --//
				IOMy.common.NavigationRefreshButtons( me );
				
				//console.log(JSON.stringify(IOMy.functions.generateDeviceListData()));
				me.DestroyUI();
				me.DrawUI();
			}
		});
	},
	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.DeviceList
*/
	onBeforeRendering: function() {

	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.DeviceList
*/
	onAfterRendering: function() {

	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.DeviceList
*/
	onExit: function() {

	},
	
	DestroyUI : function () {
		//--------------------------//
        // Capture scope
        //--------------------------//
        var me = this;
        
        // Wipe main list container
        if (me.wPanel !== null) {
            me.wPanel.destroy();
        }
        
        // Wipe any elements with IDs assigned to them
        for (var i = 0; i < me.aElementsToDestroy.length; i++) {
            me.byId(me.aElementsToDestroy[i]).destroy();
        }
        
        // Clear the element list
        me.aElementsToDestroy = [];
	},
	
	DrawUI : function () {
		//--------------------------------------------------------------------//
		// Variables
		//--------------------------------------------------------------------//
		var me				= this;
		var oView			= me.getView();
		var jsonDeviceList	= IOMy.functions.generateDeviceListData();
		
		//--------------------------------------------------------------------//
		// Draw the containing Panel
		//--------------------------------------------------------------------//
		me.wPanel = new sap.m.Panel ({
			backgroundDesign: "Transparent"
		}).addStyleClass("MasterPanel PanelNoPadding PadBottom10px UserInputForm MarTop3px");
		
		//--------------------------------------------------------------------//
		// Start Drawing the table(s)
		//--------------------------------------------------------------------//
		$.each(jsonDeviceList.Premises, function (sI, mPremise) {
			
			// -- Parent VBox. Aligns children vertically -- //
			var oPremiseTable = new sap.m.VBox({});
			
			//--------------------------------------------------------------------//
			// Start Drawing the table header with the Premise and Hub names 
			//--------------------------------------------------------------------//
			$.each(mPremise.Hubs, function (sJ, mHub) {
				
				// -- Device Header Contains the Premise Name and the Hub Name -- //
				var oDeviceHeader = new sap.m.HBox({
					items : [
						// -- HBox Label Container. Aligns children horizontally -- //
						new sap.m.HBox({
							items : [
							 new sap.m.Link({
								text : mPremise.PremiseName,
								width: "100%",
								press : function () {
									IOMy.common.PremiseSelected = IOMy.common.getPremise(mPremise.PremiseId);
									IOMy.common.NavigationChangePage("pSettingsPremiseInfo");
								}
							}).addStyleClass("Font-RobotoCondensed TextSizeMedium Text_grey_20")
							]
						}).addStyleClass("MarLeft3px"),
						new sap.m.HBox({
							width: "90%",
							justifyContent: "End",
							items : [
								 new sap.m.Link({
									text : mHub.HubName,
									width: "100%",
									press : function () {
										IOMy.common.NavigationChangePage("pSettingsPremiseHub", { "hub": IOMy.common.getHub(mHub.HubId) }, false);
									}
								}).addStyleClass("Font-RobotoCondensed TextSizeMedium Text_grey_20")
							]
						}).addStyleClass("MarRight3px")
					]
				}).addStyleClass("ConsistentMenuHeader ListItem width100Percent");
				
				//-- Add the header to the table. --//
				oPremiseTable.addItem(oDeviceHeader);
				
				//--------------------------------------------------------------------//
				// Start Drawing the thing entries if there are any attached to the hub.
				//--------------------------------------------------------------------//
				if (JSON.stringify(mHub.Things) !== "{}") {
					$.each(mHub.Things, function (sK, mThing) {

						var sSerialNumber = "";
						var oEntry;

						if (IOMy.common.getLink(mThing.LinkId).LinkSerialCode !== null) {
							sSerialNumber = "SN: " + IOMy.common.getLink(mThing.LinkId).LinkSerialCode;
						}

						//--------------------------------------------------------------------//
						// All thing entries will have of course the device name, the button to
						// edit its details, device type, and the serial number if it exists.
						//--------------------------------------------------------------------//
						oEntry = new sap.m.HBox({
							items : [
								new sap.m.VBox({
									layoutData : new sap.m.FlexItemData({
										growFactor : 8
									}),
									items : [
										//----------------------------------------//
										// Buttons
										//----------------------------------------//
										new sap.m.HBox({
											layoutData : new sap.m.FlexItemData({
												growFactor : 1
											}),
											items : [
												//-----------------------------//
												// Device name
												//-----------------------------//
												new sap.m.Link({
													layoutData : new sap.m.FlexItemData({
														growFactor : 9
													}),
													text : mThing.DisplayName,
													width: "100%",
													press : function () {
														IOMy.common.NavigationChangePage( IOMy.devices.getDevicePageID(mThing.TypeId), { "ThingId":mThing.Id }, false);
													}
												}).addStyleClass("Font-RobotoCondensed TextSizeMedium Text_grey_20 MarTop1d0Rem iOmyLink"),

												//-----------------------------//
												// Device Edit Button
												//-----------------------------//
												new sap.ui.core.Icon({
													layoutData : new sap.m.FlexItemData({
														growFactor : 0.25
													}),
													src: "sap-icon://edit",
													press : function () {
														IOMy.common.NavigationChangePage("pSettingsEditThing", { "ThingId": mThing.Id }, false );
													}
												}).addStyleClass("Text_grey_20 MarTop1d25Rem"),
											]
										}),

										//----------------------------------------//
										// Footer
										//----------------------------------------//
										new sap.m.HBox({
											width: "100%",
											items : [
												//-- Device Type --//
												new sap.m.Label({
													text: mThing.TypeName
												}).addStyleClass("Font-RobotoCondensed TextSizeXSmall Text_grey_20"),

												//-- Serial Number --//
												new sap.m.HBox({
													layoutData : new sap.m.FlexItemData({
														growFactor : 1
													}),
													justifyContent: "End",
													items: [
														new sap.m.Label({
															text: sSerialNumber
														}).addStyleClass("Font-RobotoCondensed TextSizeXSmall Text_grey_20")
													]
												})
											]
										}).addStyleClass("")
									]
								}).addStyleClass("MarLeft4px PadRight4px")
							]
						}).addStyleClass("minheight58px ListItem");

						//-- Add the device entry to the table. --//
						oPremiseTable.addItem(oEntry);
					});
					
				//--------------------------------------------------------------------//
				// Otherwise show a notice that they don't have devices attached to this
				// hub.
				//--------------------------------------------------------------------//
				} else {
					oPremiseTable.addItem(
						new sap.m.HBox({
							items : [
								new sap.m.VBox({
									layoutData : new sap.m.FlexItemData({
										growFactor : 8
									}),
									items : [
										//----------------------------------------//
										// Buttons
										//----------------------------------------//
										new sap.m.HBox({
											layoutData : new sap.m.FlexItemData({
												growFactor : 1
											}),
											items : [
												//-----------------------------//
												// Notification
												//-----------------------------//
												new sap.m.Link({
													layoutData : new sap.m.FlexItemData({
														growFactor : 9
													}),
													text : "No devices attached to this hub",
													width: "100%",
													press : function () {
														IOMy.common.NavigationChangePage("pSettingsLinkAdd", {}, false );
													}
												}).addStyleClass("Font-RobotoCondensed TextSizeMedium Text_grey_20 MarTop1d0Rem iOmyLink"),

//												//-----------------------------//
//												// Add Link Button
//												//-----------------------------//
												new sap.ui.core.Icon({
													layoutData : new sap.m.FlexItemData({
														growFactor : 0.25
													}),
													src: "sap-icon://add",
													press : function () {
														IOMy.common.NavigationChangePage("pSettingsLinkAdd", {}, false );
													}
												}).addStyleClass("Text_grey_20 MarTop1d25Rem")
											]
										})
									]
								}).addStyleClass("MarLeft4px PadRight4px")
							]
						}).addStyleClass("minheight58px ListItem")
					);
				}
				
			});
			
			me.wPanel.addContent(oPremiseTable);
			
		});
		
		oView.byId("page").addContent(me.wPanel);
		
		//-- Insert the action menu used to add a device. --//
        oView.byId("extrasMenuHolder").destroyItems();
        oView.byId("extrasMenuHolder").addItem(
            IOMy.widgets.getActionMenu({
                id : me.createId("extrasMenu"),
                tooltip: "Action Menu",
                items : [
                    {
                        text: "Add Device",
                        select : function () {
                            IOMy.common.NavigationChangePage( "pSettingsLinkAdd", {}, false );
                        }
                    }
                ]
            })
        );
	}
	
});