/*
Title: Action Menu Widget Function
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
    Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
Description: Creates the action menu for a page, and populates it with items.
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

$.sap.declare("IOMy.widgets.getActionMenu",true);

$.extend(IOMy.widgets,{
    
    /**
     * Flag to indicate whether the action menu is open or closed.
     */
    extrasMenuOpen : false,
    
    /**************************************************************************\
    |* A widget that will return a button to summon the action menu           *|
    |* (sap-icon://GoogleMaterial/add_circle).                                *|
    \**************************************************************************/
    /**
     * Constructs a button that will bring up a menu whose items are defined in the
     * mSettings.items variable.
     * 
     * @param {JS Object} mSettings     Map of parameters.
     * @return {sap.m.HBox}             Extras menu button
     */
    getActionMenu: function (mSettings) {
        var me = this;
        // STEP 1: Create the menu items for the widget.
        var oNavList = new sap.tnt.NavigationList({});
        
        try {
            if (mSettings.items === undefined) {
                //-----------------------------------------------------------------------------//
                //-- 'items' has not been found. Throw an error.                             --//
                //-----------------------------------------------------------------------------//
                var sErrMessage = "Expected a list of items, 'items' not declared.";
                throw sErrMessage;
            } else {
                for (var i = 0; i < mSettings.items.length; i++) {
                    //----------------------------------------------------------------------------//
                    //-- Flags to indicate whether optional parameters are discovered           --//
                    //----------------------------------------------------------------------------//
                    var bCheckIcon          = false;
                    var bCheckSelect        = false;
                    var bCheckMenuItemID    = false;

                    //----------------------------------------------------------------------------//
                    //-- PART 1 - Check to see what Parameters are passed                       --//
                    //----------------------------------------------------------------------------//
                    if( mSettings.items[i] ) {
                        //-- Check Text (REQUIRED) --//
                        if( mSettings.items[i].text === undefined ) {
                            // Throw an exception for debugging.
                            throw "'text' is not declared for one of the items. This is the item declared:\n\n"+JSON.stringify(mSettings.items[i]);
                        }
                        
                        //-- Check Icon --//
                        if( mSettings.items[i].icon ) {
                            bCheckIcon = true;
                        } else {
                            bCheckIcon = false;
                        }

                        //-- Check Select --//
                        if( mSettings.items[i].select ) {
                            bCheckSelect = true;
                        } else {
                            bCheckSelect = false;
                        }
                        
                        //-- Check Widget ID --//
                        if( mSettings.items[i].id ) {
                            bCheckMenuItemID = true;
                        } else {
                            bCheckMenuItemID = false;
                        }
                    }
                    
                    // Assign a default ID if one isn't defined.
                    // TODO: Remove this once all of the extras menu invocations use an ID.
                    if (mSettings.id === undefined) {
                        mSettings.id = "extrasMenu"; 
                    }

                    //----------------------------------------------------------------------------//
                    //-- PART 2 - Choose the correct button based upon what values are passed   --//
                    //----------------------------------------------------------------------------//
                    if (bCheckMenuItemID===true) {
                        if( bCheckIcon===true && bCheckSelect===true ) {
                            //-- NORMAL BUTTON --//
                            oNavList.addItem(
                                new sap.tnt.NavigationListItem(mSettings.items[i].id, {
                                    text: mSettings.items[i].text,
                                    icon: mSettings.items[i].icon,
                                    select:	mSettings.items[i].select
                                })
                            );
                        } else if( bCheckSelect===true ) {
                            oNavList.addItem(
                                new sap.tnt.NavigationListItem(mSettings.items[i].id, {
                                    // [No Child Icon],
                                    text: mSettings.items[i].text,
                                    select:	mSettings.items[i].select
                                })
                            );
                        } else if( bCheckIcon===true ) {
                            oNavList.addItem(
                                new sap.tnt.NavigationListItem(mSettings.items[i].id, {
                                    // [No Child Select],
                                    text: mSettings.items[i].text,
                                    icon: mSettings.items[i].icon,
                                    select: function() {
                                        jQuery.sap.log.warning("No select function has been configured by the UI Developer yet!");
                                    }
                                })
                            );
                        } else {
                            oNavList.addItem(
                                new sap.tnt.NavigationListItem({
                                    // [No Child Icon and no Child Select],
                                    text: mSettings.items[i].text,
                                    select: function() {
                                        jQuery.sap.log.warning("No select function has been configured by the UI Developer yet!");
                                    }
                                })
                            );
                        }
                    } else {
                        if( bCheckIcon===true && bCheckSelect===true ) {
                            //-- NORMAL BUTTON --//
                            oNavList.addItem(
                                new sap.tnt.NavigationListItem({
                                    text: mSettings.items[i].text,
                                    icon: mSettings.items[i].icon,
                                    select:	mSettings.items[i].select
                                })
                            );
                        } else if( bCheckSelect===true ) {
                            oNavList.addItem(
                                new sap.tnt.NavigationListItem({
                                    // [No Child Icon],
                                    text: mSettings.items[i].text,
                                    select:	mSettings.items[i].select
                                })
                            );
                        } else if( bCheckIcon===true ) {
                            oNavList.addItem(
                                new sap.tnt.NavigationListItem({
                                    // [No Child Select],
                                    text: mSettings.items[i].text,
                                    icon: mSettings.items[i].icon,
                                    select: function() {
                                        jQuery.sap.log.warning("No select function has been configured by the UI Developer yet!");
                                    }
                                })
                            );
                        } else {
                            oNavList.addItem(
                                new sap.tnt.NavigationListItem({
                                    // [No Child Icon and no Child Select],
                                    text: mSettings.items[i].text,
                                    select: function() {
                                        jQuery.sap.log.warning("No select function has been configured by the UI Developer yet!");
                                    }
                                })
                            );
                        }
                    }
                }
            }
        } catch (e) {
            jQuery.sap.log.error("STEP 1: Error creating the navigation list: "+e.message);
        }
        
        // STEP 2: Create the HBox that will contain the widget.
        try {
            var oWidget = new sap.m.HBox({
                items : [
                    new sap.m.VBox({
                        items : [
                            new sap.m.Button({
                                tooltip: "Action Menu",
                                icon : "sap-icon://GoogleMaterial/add_circle",
                                press : function (oControlEvent) {
                                    
                                    var oButton = oControlEvent.getSource();
                                    
                                    if (me.extrasMenuOpen === false) {
                                        // Get or create a new extra menu
                                        var oMenu;
                                        if (sap.ui.getCore().byId(mSettings.id) === undefined) {
                                            oMenu = new sap.m.Popover(mSettings.id, {
                                                placement: sap.m.PlacementType.Bottom,
                                                showHeader : false,
                                                content: [oNavList]
                                            }).addStyleClass("IOMYNavMenuContainer");
                                        } else {
                                            oMenu = sap.ui.getCore().byId(mSettings.id);
                                        }

                                        oMenu.attachAfterClose(function () {
                                            me.extrasMenuOpen = false;
                                            oButton.setIcon("sap-icon://GoogleMaterial/add_circle");
                                        });
                                    
                                        oButton.setIcon("sap-icon://GoogleMaterial/remove_circle");
                                        oMenu.openBy(oButton);
                                        me.extrasMenuOpen = true;
                                    } else {
                                        sap.ui.getCore().byId(mSettings.id).close();
                                    }
                                }
                            }).addStyleClass("ButtonNoBorder IOMYButton TextCenter TextSize40px width100Percent")
                        ]
                    }).addStyleClass("")
                ]
            }).addStyleClass("width100Percent MarTop4px");

            return oWidget;
        } catch (e) {
            jQuery.sap.log.error("STEP 2: Error creating the widget: "+e.message);
        }
    }
    
});