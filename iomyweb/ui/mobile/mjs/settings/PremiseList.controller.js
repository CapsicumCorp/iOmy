/*
Title: Premise List (Settings) UI5 Controller
Author: Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
Modified: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws a list of all the premises accessible and their
    hubs.
Copyright: Capsicum Corporation 2016, 2017

This file is part of the iOmy project.

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

sap.ui.controller("mjs.settings.PremiseList", {
	
	bInitialised:					false,			//-- BOOLEAN:	Used to indicate if the page ahs been displayed or not			--//
	aObjectsToPurge:				[],				//-- ARRAY:		List of Id names of UI5 objects to purge						--//
	iAjaxUpdatesDuration:			600000,			//-- INTEGER:	This is the duration in milliseconds between when the Page should refresh the Ajax Data. (10 minutes)				--//
	premiseExpanded:                {},             //-- ASSOCIATIVE ARRAY: Stores the visibility flags of each hub list        --//
	
    hubs:                           [],
	//aPremises:					[],			//-- ARRAY:		This holds the current Premise Data that is used to remove the existing page contents on refresh --//
	//aHubs:						[],			//-- ARRAY:		This holds the current Hub Data that is used to remove the existing page contents on refresh --//
	wPanel:							null,
	
	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf mjs.settings.PremiseList
	 */
	onInit: function() {
		var me = this;
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			onBeforeShow: function (evt) {
				//-- Refresh the Navigational buttons --//
				IOMy.common.NavigationRefreshButtons( me );
				
				//me.composePremiseList();
				me.CheckIfValuesAreRecent();
			}
		});
	},
	
	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	 * (NOT before the first rendering! onInit() is used for that one!).
	 * @memberOf mjs.settings.PremiseList
	 */
	//onBeforeRendering: function() {},

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf mjs.settings.PremiseList
	 */
	//onAfterRendering: function() {},
	
	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * @memberOf mjs.settings.PremiseList
	 */
	//onExit: function() {}
	
	//====================================================================================================================//
	//== FUNCTION: CheckIfValuesAreRecent																				==//
	//====================================================================================================================//
    
    /**
     * Procedure that performs a check to see if the premise list is updated to list all the current
     * premise and hub names. If it needs updating, it wil run RemoveExistingSettingsPremiseList() and
     * RedrawSettingsPremiseList() (in this current controller) to redraw the entire list after updating
     * the premise list in memory.
     */
	CheckIfValuesAreRecent: function() {
		
		
		//====================================================================//
		//== 1.0 - INITIALISE VARIABLES										==//
		//====================================================================//
		var me						= this;				//-- SCOPE:		Binds the Current Scope for Sub functions --//
		var oCurrentView			= me.getView();		//-- OBJECT:	Current View								--//
		var bPremiseListUpToDate	= false;			//-- BOOLEAN:	Used to indicate if the Premise List is up to date or not --//
		var bHubListUpToDate    	= false;			//-- BOOLEAN:	Used to indicate if the Hub List is up to date or not --//
		var dCurrentTimestamp		= new Date();		//-- DATE:		--//
		
		//====================================================================//
		//== 2.0 - CHECK LAST UPDATE TIMES									==//
		//====================================================================//
		
		//-- IF the Page is setup then check if any requirements are up to date --//
		if( me.bInitialised===true) {
			//-- PREMISE LIST --//
			if( IOMy.common.PremiseListLastUpdate.getTime() > (dCurrentTimestamp.getTime() - me.iAjaxUpdatesDuration ) ) {
				//-- Premise List is up to date so no need to refresh it --//
				bPremiseListUpToDate = true;
			}
			
			//-- HUB LIST --//
			if( IOMy.common.HubListLastUpdate.getTime() > (dCurrentTimestamp.getTime() - me.iAjaxUpdatesDuration ) ) {
				//-- Hub List is up to date so no need to refresh it --//
				bHubListUpToDate = true;
			}
		
		//-- ELSE the Page will be Initialised --//
		} else {
			me.bInitialised=true;
		}
		
		
		
		//console.log("LastUpdate: "+IOMy.common.PremiseListLastUpdate.getTime()+" Threshold:"+(dCurrentTimestamp.getTime() - me.iAjaxUpdatesDuration )+" Value:"+(IOMy.common.PremiseListLastUpdate.getTime() - (dCurrentTimestamp.getTime() - me.iAjaxUpdatesDuration)) );
		//====================================================================//
		//== 3.0 - DECIDE WHAT NEEDS TO BE DONE								==//
		//====================================================================//
		
		//----------------------------------------//
		//-- OPTION A:	BOTH NEEDS REFRESHING	--//
		//----------------------------------------//
		if( bPremiseListUpToDate===false && bHubListUpToDate===false ) {
			//-- STEP 1 of 4 - EMPTY THE PAGE --//
			me.RemoveExistingSettingsPremiseList( me, oCurrentView );
			
			//-- STEP 2 of 4 - REFRESH PREMISE LIST --//
            try {
                IOMy.common.RefreshPremiseList({
                    onSuccess : function () {

                        //-- STEP 3 of 4 - REFRESH GATEWAY LIST --//
                        IOMy.common.RefreshHubList({
                            onSuccess: function () {

                                //-- STEP 4 of 4 - REDRAW THE PAGE --//
                                try {
                                    me.RedrawSettingsPremiseList( me, oCurrentView );
                                } catch (e) {
                                    jQuery.sap.log.error("An error occurred redrawing both the Premise List and Hub List\n\n"+e.message);
                                }
                            }
                        });
                    }
                });
                jQuery.sap.log.debug("SettingsPremiseList: Option A");
            } catch (e) {
                jQuery.sap.log.error("Attempted to redraw both the Premise List and Hub List\n\n"+e.message);
            }
			
		//----------------------------------------//
		//-- OPTION B:	REFRESH PREMISE LIST	--//
		//----------------------------------------//
		} else if( bPremiseListUpToDate===false) {
			//-- STEP 1 of 3 - EMPTY THE PAGE --//
			me.RemoveExistingSettingsPremiseList( me, oCurrentView );
			
			//-- STEP 2 of 3 - REFRESH PREMISE LIST --//
			IOMy.common.RefreshPremiseList({
				onSuccess: function () {
					//-- STEP 3 of 3 - REDRAW THE PAGE --//
					try {
                        me.RedrawSettingsPremiseList( me, oCurrentView );
                    } catch (e) {
                        jQuery.sap.log.error("An error occurred redrawing the Premise List\n\n"+e.message);
                    }
				}
			});
			
			jQuery.sap.log.debug("SettingsPremiseList: Option B");
			
		//----------------------------------------//
		//-- OPTION C:	REFRESH GATEWAY LIST	--//
		//----------------------------------------//
		} else if( bHubListUpToDate===false) {
			//-- STEP 1 of 3 - Empty the Page --//
			me.RemoveExistingSettingsPremiseList( me, oCurrentView );
					
			//-- STEP 2 of 3 - REFRESH GATEWAY LIST --//
			IOMy.common.RefreshHubList({
				onSuccess: function () {
					//-- STEP 3 of 3 - REDRAW THE PAGE --//
					me.RedrawSettingsPremiseList( me, oCurrentView );
                    try {
                        me.RedrawSettingsPremiseList( me, oCurrentView );
                    } catch (e) {
                        jQuery.sap.log.error("An error occurred redrawing the Hub List\n\n"+e.message);
                    }
				}
			});
			
			jQuery.sap.log.debug("SettingsPremiseList: Option C");
			
		//----------------------------------------//
		//-- OPTION D:	DO NOTHING				--//
		//----------------------------------------//
		} else {
			//-- Add to the Debugging Log --//
			jQuery.sap.log.debug("SettingsPremiseList didn't to perform an Ajax Request!");
			
			jQuery.sap.log.debug("SettingsPremiseList: Option D");
		}
		
		
	},	//-- END of CheckIfValuesAreRecent --//
	
	
	
	//====================================================================================================================//
	//== FUNCTION: Remove existing Items																				==//
	//====================================================================================================================//
    /**
     * Procedure to destroy the entire content of the page.
     * 
     * @param {type} me                 Current controller
     * @param {type} oThisView          Current view
     */
	RemoveExistingSettingsPremiseList: function( me, oThisView ) {
		
		var me = this;
		
		//====================================================================//
		//== 1.0 - DESTROY EXISTING OBJECTS									==//
		//====================================================================//
		$.each( me.aObjectsToPurge, function( sIndex, sItemId ) {
			//-- If the UI5 Object exists then destroy it --//
			if( me.byId( sItemId )!==undefined ) {
				me.byId( sItemId ).destroy();
			}
			
		});
		
		//====================================================================//
		//== 1.1 - DESTROY EXISTING PANEL									==//
		//====================================================================//
		
		if (me.wPanel !== null) {
            me.wPanel.destroy();
        };
	},
	
	//====================================================================================================================//
	//== FUNCTION: 																										==//
	//====================================================================================================================//
    /**
     * Constructs the Premise and Hub List in the UI.
     * 
     * @param {type} me                 Current controller
     * @param {type} oThisView          Current view
     */
	RedrawSettingsPremiseList: function ( me, oThisView ) {
		
		//====================================================================//
		//== 1.0 - INITIALISE VARIABLES										==//
		//====================================================================//
		//var me				= this;					//-- SCOPE:		Store the Current Scope for sub-functions to use. --//
		//var thisView		= me.getView();			//-- OBJECT:	Store the Current View for sub-functions to use so they can modify elements in this view. --//
		var aPremiseList	= [];					//-- ARRAY:		--//
		
		//====================================================================//
		//== 2.0 - PREPARE TO REDRAW INTERFACE								==//
		//====================================================================//
		aPremiseList = IOMy.common.PremiseList;
		
		
		//-- Setup the Container that holds all the Premises	--//
		var oPremiseListContainer = new sap.m.VBox( me.createId("PremiseListContainer"), {
			items: []
		});
		
		//-- Add to the Removable Objects --//
		me.aObjectsToPurge.push("PremiseListContainer");
		//-- Insert the Hub List into the debug log --//
        jQuery.sap.log.debug(JSON.stringify(IOMy.common.HubList));
        
        if (IOMy.common.PremiseList.length !== 0) {
            //-- Create the table headings. --//
            oPremiseListContainer.addItem(
                new sap.m.HBox({
                    items : [
                        // === HUBS === \\
                        new sap.m.VBox({
                            items : [
                                new sap.m.Label({
                                    text : "Hubs"
                                }).addStyleClass("")
                            ]
                        }).addStyleClass("FlexNoShrink width60px BorderRight TextCenter"),
                        // === PREMISES === \\
                        new sap.m.VBox({
                            items : [
                                new sap.m.Label({
                                    text : "Premises"
                                }).addStyleClass("PaddingToMatchButtonText")
                            ]
                        }).addStyleClass("")
                    ]
                }).addStyleClass("ConsistentMenuHeader ListItem")
            );
            //-- Foreach Premise  --//
            $.each( aPremiseList,function( sIndex, aPremise ) {
                //-- Verify that the Premise has values --//
                if( sIndex!==undefined && sIndex!==null && aPremise!==undefined && aPremise!==null ) {

                    var oPremiseContainer       = null;		//-- OBJECT:		Used to hold the number of hubs (left side), premise name (middle) and show/hide hubs button (right side).		--//
                    var oPremiseShowHideButton  = null;		//-- OBJECT:		Used to store the Show/Hide hubs button.													--//
                    var oPremiseLabel			= null;		//-- OBJECT:		Used to store the Premise Label. 														--//
                    var oHubContainer           = null;		//-- OBJECT:		Used to store the Hub Container which holds the Hub Names for the Premise.		--//

                    var sPremiseContainerId		= "";		//-- STRING:		Used to store the name of the Premise Container		--//
                    var sPremiseIconId			= "";		//-- STRING:		--//
                    var sPremiseLabelId			= "";		//-- STRING:		--//
                    var sHubContainerId         = "";		//-- STRING:		--//
                    var sHubContainerRow        = "";		//-- STRING:		--//

                    //----------------------------------------------------//
                    //-- Create the Premise Label and Picture			--//
                    //----------------------------------------------------//
                    sPremiseLabelId		= "Premise_"+aPremise.Id+"_Label";
                    sPremiseIconId		= "Premise_"+aPremise.Id+"_Icon";
                    //----------------------------------------------------//
                    //-- Create the ID for Hub List Container		--//
                    //----------------------------------------------------//
                    sHubContainerId = "Premise_"+aPremise.Id+"_Hubs";

                    if ( aPremise.PermWrite===0 ) {
                        //----------------------------------------//
                        //-- A.) No Access to this Premise		--//
                        //----------------------------------------//
                        oPremiseLabel = new sap.m.Text( me.createId(sPremiseLabelId), {
                            text : aPremise.Name
                        }).addStyleClass("MarLeft6px Font_RobotoCondensed Setting-ItemLabel TextLeft width140px");

                    } else {
                        //----------------------------------------//
                        //-- B.) Access to modify this Premise	--//
                        //----------------------------------------//
                        oPremiseLabel = new sap.m.Button( me.createId( sPremiseLabelId ), {
                            text: aPremise.Name,
                            press: function () {
                                this.setEnabled(false);
                                // Find the Premise List item that has the ID of
                                // the currently selected premise and store it.
                                for (var i = 0; i < IOMy.common.PremiseList.length; i++) {
                                    if (me.byId("Premise_"+IOMy.common.PremiseList[i].Id+"_Label").getEnabled() === false) {
                                        // Grab the correct list index.
                                        IOMy.common.PremiseSelected = IOMy.common.PremiseList[i];
                                        break;
                                    }
                                }
                                //-- NAVIGATE TO PAGE --//
                                IOMy.common.NavigationChangePage( "pSettingsPremiseInfo", {} );
                                this.setEnabled(true);
                            }
                        }).addStyleClass("ButtonNoBorder IOMYButton PremiseOverviewRoomButton TextSize16px TextLeft minheight15px");
                    }

                    // Create the show/hide hub list button. May or may not be used, depending on whether
                    // there are hubs attached to a premise.
                    oPremiseShowHideButton = new sap.m.Button( me.createId( sPremiseIconId ), {
                        tooltip: "Collapse",
                        icon : "sap-icon://navigation-down-arrow",
                        press: function () {
                            // Lock the button while this procedure is running.
                            this.setEnabled(false);

                            // If the list of hubs is hidden, show it.
                            if (me.premiseExpanded["_"+aPremise.Id] === false) {
                                me.byId(sHubContainerRow).setVisible(true);
                                me.premiseExpanded["_"+aPremise.Id] = true;
                                this.setIcon("sap-icon://navigation-down-arrow");
                                this.setTooltip("Collapse");
                            // Otherwise if it's shown, hide it.
                            } else {
                                me.byId(sHubContainerRow).setVisible(false);
                                me.premiseExpanded["_"+aPremise.Id] = false;
                                this.setIcon("sap-icon://navigation-right-arrow");
                                this.setTooltip("Expand");
                            }

                            // Procedure complete, re-enable the button.
                            this.setEnabled(true);
                        }
                    }).addStyleClass("ButtonNoBorder IOMYButton ButtonIconGreen TextSize20px");

                    // Create the flag for showing the list of IO Ports for a selected IO
                    // if it doesn't already exist.
                    if (me.premiseExpanded["_"+aPremise.Id] === undefined) {
                        me.premiseExpanded["_"+aPremise.Id] = false;
                    }

                    //-- Add the Label to the list of items to remove on page refresh --//
                    me.aObjectsToPurge.push( sPremiseLabelId );
                    me.aObjectsToPurge.push( sPremiseIconId );

                    //----------------------------------------------------//
                    //-- Create the Hub List Container				--//
                    //----------------------------------------------------//
                    sHubContainerId = "Premise_"+aPremise.Id+"_Hubs";
                    sHubContainerRow = "Premise_"+aPremise.Id+"_HubRow";

                    //----------------------------------------------------//
                    //-- Add the created items to Premise Container		--//
                    //----------------------------------------------------//
                    sPremiseContainerId = "Premise_"+aPremise.Id+"_Container";
                    oPremiseContainer = new sap.m.HBox( me.createId( "Premise_"+aPremise.Id+"_Container" ), {
                        items: [
                            new sap.m.VBox({
                                items : [
                                    new sap.m.Text({
                                        textAlign : "Center",
                                        text : IOMy.functions.getNumberOfHubsInPremise(aPremise.Id)
                                    }).addStyleClass("NumberLabel TextBold TextSize20px MarTop10px MarLeft5px MarRight5px")
                                ]
                            }).addStyleClass("FlexNoShrink width60px BorderRight TextCenter"),
                            new sap.m.VBox({
                                items : [oPremiseLabel]
                            }).addStyleClass("width100Percent TextOverflowEllipsis")
                        ]
                    }).addStyleClass("ListItem TextSize16px BG_white minheight20px");

                    //-- Add the Hub Container to the list of items to remove on page refresh --//
                    me.aObjectsToPurge.push( sHubContainerId );

                    oHubContainer = new sap.m.VBox(me.createId(sHubContainerRow), {
                        items : []
                    }).addStyleClass("MainPanelElement ListItemDark width100Percent PadTop4px ListItem");

                    //-- Process any hubs that are attached to a premise --//
                    $.each( IOMy.common.HubList, function( sIndex, aHub ) {
                        me.aObjectsToPurge.push( sHubContainerRow+"_" );

                        // If it hasn't been done so already, place a show/hide button
                        if (me.byId( "Premise_"+aPremise.Id+"_Container_ShowHide" ) === undefined) {
                            jQuery.sap.log.debug("New Hub show/hide button created");
                            me.byId( "Premise_"+aPremise.Id+"_Container" ).addItem(
                                new sap.m.VBox(me.createId( "Premise_"+aPremise.Id+"_Container_ShowHide" ), {
                                    items : [oPremiseShowHideButton]
                                }).addStyleClass("FlexNoShrink width50px")
                            );
                            me.aObjectsToPurge.push( "Premise_"+aPremise.Id+"_Container_ShowHide" );
                        } else {
                            jQuery.sap.log.debug("Hub show/hide button exists.")
                        }

                        // Create the hub label
                        var sHubLabelId = "Premise_"+aPremise.Id+"_Hub_"+aHub.HubId;
                        var oHubLabel = new sap.m.Link( me.createId(sHubLabelId), {
                            text : aHub.HubName,
                            press : function () {
                                var aData;
                                var iHubId = this.getId().charAt(this.getId().length - 1);

                                $.each( IOMy.common.HubList, function( sIndex, aHubData ) {
                                    if (sIndex !== undefined && sIndex !== null && aHubData !== undefined && aHubData !== null) {
                                        if (aHubData.HubId == iHubId) {
                                            aData = aHubData;
                                            return;
                                        }
                                    }
                                });

                                IOMy.common.NavigationChangePage("pSettingsPremiseHub", {hub : aData});
                            }
                        }).addStyleClass("Font-RobotoCondensed SettingsLinks TextBold Text_grey_20 TextLeft width100Percent");

                        // Add the hub label to the list of objects to purge.
                        me.aObjectsToPurge.push( sHubLabelId );

                        // Add the hub entry to the list.
                        oHubContainer.addItem(
                            new sap.m.VBox({
                                items : [oHubLabel]
                            }).addStyleClass("MarLeft8px")
                        );

                    });

                    // Decide whether to hide or show when the page loads/reloads.
                    if (me.premiseExpanded["_"+aPremise.Id] === false) {
                        me.byId(sHubContainerRow).setVisible(false);
                        oPremiseShowHideButton.setIcon("sap-icon://navigation-right-arrow").setTooltip("Expand");
                    }


                    //-- Add the Hub Container to the list of items to remove on page refresh --//
                    me.aObjectsToPurge.push( sPremiseContainerId );

                    //------------------------------------------------------------------------//
                    //-- Add the Premise Container and Hub Container to the PremiseList	--//
                    //------------------------------------------------------------------------//
                    oPremiseListContainer.addItem( oPremiseContainer );
                    oPremiseListContainer.addItem( oHubContainer );

                    //----------------------------------------------------//
                    //-- End of Foreach Premise							--//
                    //----------------------------------------------------//

                }
            });
        } else {
            //----------------------------------------------------------------//
            // There are no premises visible to the user. Report it.
            //----------------------------------------------------------------//
            oPremiseListContainer.addItem(
                new sap.m.Text({
                    text : "You have no premises visible to you."
                })
            );
        }
		
		//====================================================================//
		//== 4.0 - Add to the Page Panel									==//
		//====================================================================//
		me.wPanel = new sap.m.Panel(me.createId("Panel"), {
			backgroundDesign: "Transparent",
			content: [oPremiseListContainer]
		}).addStyleClass("MasterPanel UserInputForm PanelNoPadding PadTop3px PadBottom15px")
		
		oThisView.byId("page").addContent( me.wPanel );
		
	}
	
	




});