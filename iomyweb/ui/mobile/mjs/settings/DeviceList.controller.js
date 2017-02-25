/*
Title: Device Overview Page (UI5 Controller)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws the list of links and their items.
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
	
	devices : [],
	aThingIds : [],
    aLinkIds : [],
    
    wVertBox : null,
    
    aElementsToDestroy : [], // Stores the IDs of elements that need to be destroyed once this page loads.
    
    ioExpanded : {},
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.settings.DeviceList
*/
	onInit: function() {
		var me = this;
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			onBeforeShow : function (evt) {
				//-- Refresh the Navigational buttons --//
				IOMy.common.NavigationRefreshButtons( me );
				
				me.DestroyUI();
				me.DrawUI();
			}
		});
	},
    
    /**
     * Procedure that destroys the previous incarnation of the UI. Must be called by onInit before
     * (re)creating the page.
     */
    DestroyUI : function () {
        var me = this;
        
        // Destroy the old panel if it exists.
		if (me.byId("panel") !== undefined) {
			me.byId("panel").destroy();
        }
        
//        if (me.wVertBox !== null) {
//            me.wVertBox.destroy();
//        }
    },
	
    /**
     * Construct the list of links and their things.
     */
	DrawUI : function () {
        // Variables for scope
		var me = this;                  // Controller
		var thisView = me.getView();    // View
		
        var me = this;
		if (me.timerInterval !== null)
			clearInterval(me.timerInterval);
        
        // Clear the arrays managed by this controller.
		me.devices = [];
        me.aThingIds = [];
        me.aLinkIds = [];
		
        // Assign the Link and Thing lists to a shorter variable name
        var aLinks = IOMy.common.LinkList;
		var devices = IOMy.common.ThingList;
        var aLinksAndItems = [];
        // Log the contents of the Link and Thing lists.
		jQuery.sap.log.debug(JSON.stringify(aLinks));
		jQuery.sap.log.debug(JSON.stringify(devices));
		
        //=====================================================================\\
		// Sort the items alphabetically.                                      \\
        //=====================================================================\\
		var aTempDevices = [];
		var aDisplayNames = [];
		
		$.each(devices,function(sIndex,aDevice) {
			aDisplayNames.push(aDevice.DisplayName);
		});
		aDisplayNames.sort();
		for (var i = 0; i < aDisplayNames.length; i++) {
			$.each(devices,function(sIndex,aDevice) {
				if (aDisplayNames[i] === aDevice.DisplayName) {
					aTempDevices.push(aDevice);
				}
			});
		}
		jQuery.sap.log.debug(JSON.stringify(aTempDevices));
		devices = aTempDevices;
		//console.log(JSON.stringify(devices));
        
        for (var i = 0; i < aLinks.length; i++) {
            //--------------------------------------------------//
            // Create an object within the current link to store the items
            //--------------------------------------------------//
            aLinks[i].Things = {};
            
            //--------------------------------------------------//
            // Populate the link with its things
            //--------------------------------------------------//
            $.each(devices,function(sIndex,aDevice) {
                //-- Verify that the Thing has values --//
                if( sIndex!==undefined && sIndex!==null && aDevice!==undefined && aDevice!==null &&
                        aDevice.LinkId == aLinks[i].LinkId) {
                    
                    // Insert the device
                    aLinks[i].Things["_"+aDevice.Id] = aDevice;
                    
                }
            });
            
            //--------------------------------------------------//
            // Add the link info to the main associative array
            //--------------------------------------------------//
            aLinksAndItems.push(aLinks[i]);
        }
        
        //console.log(JSON.stringify(aLinksAndItems));
		
        //=================================================================\\
		// Sort the items to their links and list each one alphabetically. \\
        //=================================================================\\
		me.wVertBox = new sap.m.VBox({
			items: []
		}).addStyleClass("");

		// Layout Objects
		var oLayout = new sap.m.VBox({
			items: []
		}).addStyleClass("");
        
        //=======Place the table headings into the main layout object=======\\
		oLayout.addItem(
            new sap.m.HBox({
                items : [
                    new sap.m.VBox({
                        items : [
                            new sap.m.Label({
                                text: "Items"
                            }).addStyleClass("MarTop5px MarBottom5px MarLeft5px MarRight5px")
                        ]
                    }).addStyleClass("FlexNoShrink width60px BorderRight TextCenter"),
                    new sap.m.VBox({
                        items : [
                            new sap.m.Label({
                                text: "Links"
                            }).addStyleClass("TextLeft MarTop5px MarBottom5px width100Percent PaddingToMatchButtonText")
                        ]
                    }).addStyleClass("width100Percent")
                ]
            }).addStyleClass("ConsistentMenuHeader ListItem")
        );

        //=============================\\
        // Start constructing the list \\
        //=============================\\
        
        // Declare variables
        var iLinkRow = 0;
        var iNumberOfThings;
        var oLinkGroupBox, oThingListBox;
        
        // Process the links
        for (var i = 0; i < aLinksAndItems.length; i++) {
            me.aLinkIds.push(aLinksAndItems[i].LinkId);
            
            //=== INSERT ELEMENTS TO DESTROY ===//
            me.aElementsToDestroy.push("ThingListBox"+aLinksAndItems[i].LinkId);
            me.aElementsToDestroy.push("ioButton"+aLinksAndItems[i].LinkId);
            me.aElementsToDestroy.push("ioExpandCollapse"+aLinksAndItems[i].LinkId);
            me.aElementsToDestroy.push("ioExpandCollapseButton"+aLinksAndItems[i].LinkId);
            
            //=== INSERT THE TOP BUTTON/HEADER FOR THE LINK THE PORT BELONGS TO ===\\
            iNumberOfThings = IOMy.functions.getNumberOfThingsInLink(aLinksAndItems[i].LinkId);
            
            //=== CREATE A BOX TO HOLD A LIST OF ANY ITEMS ATTACHED TO A LIST ===\\
            oThingListBox = new sap.m.VBox(me.createId("ThingListBox"+aLinksAndItems[i].LinkId), {});
            
            //=== CREATE THE LINK ENTRY ===\\
            oLinkGroupBox = new sap.m.VBox({
                items : [
                    new sap.m.HBox({
                        items : [
                            // Number of Items/Things
                            new sap.m.VBox({
                                items : [
                                    new sap.m.Text({
                                        textAlign : "Center",
                                        text : iNumberOfThings
                                    }).addStyleClass("NumberLabel TextBold MarTop10px MarLeft5px MarRight5px")
                                ]
                            }).addStyleClass("width60px FlexNoShrink BorderRight TextCenter"),
                            
                            // Button to show the link name and take the user to the edit link page when pressed.
                            new sap.m.VBox({
                                items : [
                                    new sap.m.Button(me.createId("ioButton"+aLinksAndItems[i].LinkId),{
                                        text : aLinksAndItems[i].LinkName,
                                        press : function (oController) {
                                            // Lock the button
                                            this.setEnabled(false);

                                            var oLink;
                                            // Using the Link List found in common because the scope is global.
                                            for (var j = 0; j < IOMy.common.LinkList.length; j++) {
                                                if (me.byId("ioButton"+IOMy.common.LinkList[j].LinkId).getEnabled() === false) {
                                                    oLink = IOMy.common.LinkList[j];
                                                    break;
                                                }
                                            }
                                            // Change to the edit link page parsing the correct link to the page.
                                            IOMy.common.NavigationChangePage("pSettingsEditLink", {link : oLink});

                                            // Unlock the button
                                            this.setEnabled(true);
                                        }
                                    }).addStyleClass("ButtonNoBorder DeviceButton IOMYButton TextSize16px TextLeft")
                                ]
                            }).addStyleClass("width100Percent TextOverflowEllipsis"),
                            
                            // Widget to house a button to expand or collapse a list of things associated with this link.
                            new sap.m.VBox(me.createId("ioExpandCollapse"+aLinksAndItems[i].LinkId), {})
                        ]
                    }).addStyleClass("ListItem minheight20px"),
                    
                    // Insert the item list holder.
                    oThingListBox
                ]
            });
            oLayout.addItem(oLinkGroupBox);
            
            //=== POPULATE THE THING BOX ===\\
            $.each(aLinksAndItems[i].Things,function(sIndex,aDevice) {
                //-- Verify that the Sensor has values --//
                if( sIndex!==undefined && sIndex!==null && aDevice!==undefined && aDevice!==null) {
                    
                    var mDeviceData = aDevice;
                    
                    // Add the expand/collapse icon to the right of the link entry if it doesn't already exist.
                    // Only created when there are items attached to the current link.
                    if (me.byId("ioExpandCollapseButton"+aLinksAndItems[i].LinkId) === undefined) {
                        
                        me.byId("ioExpandCollapse"+aLinksAndItems[i].LinkId).addItem(
                            new sap.m.Button(me.createId("ioExpandCollapseButton"+aLinksAndItems[i].LinkId), {
                                icon : "sap-icon://navigation-down-arrow",
                                press : function () {
                                    // Lock the button
                                    this.setEnabled(false);

                                    var iSelected;
                                    // Search for the right Link Collapse/Expand button called
                                    for (var j = 0; j < me.aLinkIds.length; j++) {
                                        // Once found, either show or hide the thing list for that Link
                                        if (me.byId("ioExpandCollapseButton"+me.aLinkIds[j]) !== undefined) {
                                            if (me.byId("ioExpandCollapseButton"+me.aLinkIds[j]).getEnabled() === false) {
                                                iSelected = j;
                                                // Terminate the loop, nothing more to do here
                                                break;
                                            }
                                        }
                                    }

                                    // Show or hide the list of items
                                    if (me.ioExpanded["_"+me.aLinkIds[iSelected]] === false) {
                                        me.byId("ThingListBox"+me.aLinkIds[iSelected]).setVisible(true);
                                        me.ioExpanded["_"+me.aLinkIds[iSelected]] = true;
                                        this.setIcon("sap-icon://navigation-down-arrow");
                                    } else {
                                        me.byId("ThingListBox"+me.aLinkIds[iSelected]).setVisible(false);
                                        me.ioExpanded["_"+me.aLinkIds[iSelected]] = false;
                                        this.setIcon("sap-icon://navigation-right-arrow");
                                    }

                                    // Unlock the button
                                    this.setEnabled(true);
                                }
                            }).addStyleClass("ButtonNoBorder IOMYButton ButtonIconGreen TextSize20px")
                        ).addStyleClass("FlexNoShrink minwidth70px");
                    }
                    
                    // Create the flag for showing the list of things for a selected Link
                    // if it doesn't already exist.
                    if (me.ioExpanded["_"+aLinksAndItems[i].LinkId] === undefined)
                        me.ioExpanded["_"+aLinksAndItems[i].LinkId] = false;
                    
                    me.aThingIds.push(mDeviceData.Id);
                    
                    //=== INSERT ELEMENTS TO DESTROY ===//
                    me.aElementsToDestroy.push("deviceRow"+mDeviceData.Id);
                    me.aElementsToDestroy.push("device"+mDeviceData.Id);

                    oThingListBox.addItem(
                        // Device Link
                        new sap.m.HBox(me.createId("deviceRow"+mDeviceData.Id),{
                            items : [
                                new sap.m.VBox({
                                    items : [
                                        new sap.m.Link(me.createId("device"+mDeviceData.Id),{
                                            text : mDeviceData.DisplayName,
                                            press : function () {
                                                IOMy.common.NavigationChangePage("pSettingsEditThing", {device : mDeviceData});
                                            }
                                        }).addStyleClass("SettingsLinks Font-RobotoCondensed PadLeft8px TextBold TextLeft Text_grey_20 width100Percent minwidth140px")
                                    ]
                                }).addStyleClass("width100Percent"),
                            ]
                        }).addStyleClass("MainPanelElement ListItem MarTop3px PadTop8px PadBottom8px ListItemDark")
                    );
                }
            });
            
            // Decide whether to hide or show when the page loads/reloads.
            if (me.ioExpanded["_"+aLinksAndItems[i].LinkId] === false) {
                me.byId("ThingListBox"+aLinksAndItems[i].LinkId).setVisible(false);
                me.byId("ioExpandCollapseButton"+aLinksAndItems[i].LinkId).setIcon("sap-icon://navigation-right-arrow");
            }
            
            iLinkRow++;
        }
        
        me.wVertBox.addItem(oLayout);
        
		var oPanel = new sap.m.Panel(me.createId("panel"), {
			backgroundDesign: "Transparent",
			content: [me.wVertBox] //-- End of Panel Content --//
		}).addStyleClass("height100Percent PanelNoPadding UserInputForm  MasterPanel PadTop3px PadBottom15px");

		thisView.byId("page").addContent(oPanel);
        
        //-- Insert the extras menu used to list options to either a link or an item to a link. --//
        thisView.byId("extrasMenuHolder").destroyItems();
        thisView.byId("extrasMenuHolder").addItem(
            IOMy.widgets.getActionMenu({
                id : me.createId("extrasMenu"),        // Uses the page ID
                icon : "sap-icon://GoogleMaterial/add_circle",
                items : [
                    {
                        text: "Add Link",
                        select : function () {
                            IOMy.common.NavigationChangePage( "pSettingsLinkAdd", {}, false );
                        }
                    },
                    {
                        text: "Add Item",
                        select : function () {
                            if (me.aLinkIds.length > 0) {
                                IOMy.common.NavigationChangePage( "pSettingsThingAdd", {}, false );
                            } else {
                                IOMy.common.showError("You must add a link first before creating an item!", "No Links");
                            }
                        }
                    }
                ]
            })
        );
	},
    
//    DestroyUI : function () {
//        var me = this;
//        
//        for (var i = 0; i < me.aElementsToDestroy.length; i++) {
//            if (me.byId(me.aElementsToDestroy[i]) !== undefined)
//                me.byId(me.aElementsToDestroy[i]).destroy();
//        }
//        
//        me.aElementsToDestroy = []; // Clear the array.
//    }
	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.DeviceList
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.DeviceList
*/
//	onAfterRendering: function() {
//		
//	}
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.DeviceList
*/
//	onExit: function() {
//
//	}

});