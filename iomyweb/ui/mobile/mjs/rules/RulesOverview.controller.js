/*
Title: Rules Overview Controller
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: 
Copyright: Capsicum Corporation 2015, 2016

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

sap.ui.controller("mjs.rules.RulesOverview", {
    
    wPanel                  : null,
    
    aElementsToDestroy      : [],
    destroyItemsWithIDs     : IOMy.functions.destroyItemsByIdFromView,
	
    Entries : [
        {
            "Id" : 1,
            "DisplayName" : "TV",
            "SerialCode" : "00137A000000AD88",
            "OnTime" : "6:00pm",
            "OffTime" : "12:00am"
        },
        {
            "Id" : 2,
            "DisplayName" : "Fridge",
            "SerialCode" : "00137A000000AD87",
            "OnTime" : "8:00am",
            "OffTime" : "5:00pm"
        },
        {
            "Id" : 3,
            "DisplayName" : "Lamp",
            "SerialCode" : "00137A000000AD86",
            "OnTime" : "11:00pm",
            "OffTime" : "6:00am"
        }
    ],
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.rules.RulesOverview
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
                
                me.DestroyUI();
				me.DrawUI();
                
			}
		});
	},
	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.rules.RulesOverview
*/
	onBeforeRendering: function() {

	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.rules.RulesOverview
*/
	onAfterRendering: function() {

	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.rules.RulesOverview
*/
	onExit: function() {

	},
    
    /**
     * Procedure that destroys the previous incarnation of the UI. Must be called by onInit before
     * (re)creating the page.
     */
    DestroyUI : function() {
        //--------------------------//
        // Capture scope
        //--------------------------//
        var me = this;
        
        // Wipe main list container
        if (me.wPanel !== null) {
            me.wPanel.destroy();
        }
        
        // Wipe any elements with IDs assigned to them
        me.destroyItemsWithIDs(me, me.aElementsToDestroy);
        
        // Clear the element list
        me.aElementsToDestroy = [];
    },
    
    /**
     * Constructs the user interface for this page.
     */
    DrawUI : function () {
        var me = this;
        var thisView = me.getView();
		var mHub = IOMy.common.getHub(1);
		var sUrl = IOMy.apiphp.APILocation("permissions");
		var wContainer;
		
		//--------------------------------------------------------------------//
        // Draw the containing panel and add it to the page.
        //--------------------------------------------------------------------//
        me.wPanel = new sap.m.Panel ({
            backgroundDesign: "Transparent"
        }).addStyleClass("MasterPanel PanelNoPadding PadBottom10px UserInputForm MarTop3px");
        
        thisView.byId("page").addContent(me.wPanel);
		
		//--------------------------------------------------------------------//
        // Find out whether the current user is the owner.
        //--------------------------------------------------------------------//
		IOMy.apiphp.AjaxRequest({
            url : sUrl,
            data : {
                "Mode" : "LookupPremisePerms",
                "UserId" : IOMy.common.UserId,
                "PremiseId" : mHub.PremiseId
            },
            
            onSuccess : function (responseType, data) {
                if (data.Error === false) {
					//--------------------------------------------------------//
					// Show the rules list if the user is the owner and the hub
					// is a WatchInputs hub.
					//--------------------------------------------------------//
					if (data.Data.Owner === 1) {
						if (mHub.HubTypeId === 2) {
							//--------------------------------------------------------------------//
							// Draw the table that shows a list of devices and their on/off times
							//--------------------------------------------------------------------//
							wContainer = new sap.m.VBox({
								items : [
									// -- Device Header -- //
									new sap.m.VBox({
										items : [
											// -- HBox Label Container. Aligns children horizontally -- //
											new sap.m.HBox({
												items : [
													new sap.m.Label({
														text: "Zigbee Smart Plug"
													}).addStyleClass("Font-RobotoCondensed")
												]
											}).addStyleClass("MarLeft3px")
										]
									}).addStyleClass("ConsistentMenuHeader ListItem width100Percent")
								]
							});

							//--------------------------------------------------------------------//
							// Draw each device into the table
							//--------------------------------------------------------------------//
					//        for (var i = 0; i < me.Entries.length; i++) {
					//            wEntryTable.addItem( me.DrawEntry(me.Entries[i]) );
					//        }

							$.each(IOMy.common.ThingList, function (sThingIndex, mThing) {

								if (sThingIndex !== undefined && sThingIndex !== null && mThing !== undefined && mThing !== null) {
									// Looking for Zigbee Smart Plugs
									if (mThing.TypeId === 2) {
										try {
											wContainer.addItem( me.DrawEntry(mThing) );
										} catch (error) {
											// Failed to draw the thing entry, expecting a SerialCodeNullException
											if (error.name !== "SerialCodeNullException") {
												// Some other exception was thrown. Log it.
												// .getMessage() is not called because it might not be an iOmy exception.
												jQuery.sap.log.error(error.name + ": " + error.message);
											}
											// Do nothing else.
										}
									}
								}

							});
						} else {
							wContainer = new sap.m.MessageStrip({
								text : "Your hub is not a valid WatchInputs Hub. Rules are only supported on WatchInputs Hubs."
							}).addStyleClass("iOmyMessageInfoStrip");
						}
					} else {
						wContainer = new sap.m.MessageStrip({
							text : "Only the premise owner is permitted to set device rules on the current version."
						}).addStyleClass("iOmyMessageInfoStrip");
					}
                } else {
					wContainer = new sap.m.MessageStrip({
						text : "Only the premise owner is permitted to set device rules on the current version."
						//text : "Failed to check the owner permission for the current user.\n\n"+data.ErrMesg
					}).addStyleClass("iOmyMessageInfoStrip");
				}
				
				me.wPanel.addContent(wContainer);
            },
            
            onFail : function (response) {
                jQuery.sap.log.error("There was an error accessing the premise permissions: "+JSON.stringify(response));
                
				wContainer = new sap.m.MessageStrip({
					text : "Failed to check the owner permission for the current user."
				}).addStyleClass("iOmyMessageInfoStrip");
				
				me.wPanel.addContent(wContainer);
            }
            
        });
    },
    
    DrawEntry : function (mThing) {
        //var mLinkInfo = IOMy.common.getLink(mThing.LinkId);
        var sSerialCode     = IOMy.common.getLink(mThing.LinkId).LinkSerialCode;
        var sOntimeString   = "Not Set";
        var sOfftimeString  = "Not Set";
        var fnPress;
        
        if (sSerialCode !== null) {
            if (IOMy.rules.RulesList[sSerialCode] !== undefined) {
                sOntimeString = IOMy.functions.getTimestampString(IOMy.time.GetDateFromMilitaryTime( IOMy.rules.RulesList[sSerialCode].Ontime ), "", true, false);
                sOfftimeString = IOMy.functions.getTimestampString(IOMy.time.GetDateFromMilitaryTime( IOMy.rules.RulesList[sSerialCode].Offtime ), "", true, false);
                
                fnPress = function () {
                    IOMy.common.NavigationChangePage("pRuleNew", {ThingId : mThing.Id, editing : true});
                }
            } else {
                fnPress = function () {
                    IOMy.common.NavigationChangePage("pRuleNew", {ThingId : mThing.Id});
                }
            }

            var wEntryBox = new sap.m.HBox({
                items : [
                    new sap.m.VBox({
                        layoutData : new sap.m.FlexItemData({
                            growFactor : 8
                        }),
                        items : [
                            new sap.m.Link({
                                text : mThing.DisplayName,
                                width: "100%",
                                press : fnPress
                            }).addStyleClass("Font-RobotoCondensed TextSizeMedium Text_grey_20 MarTop1d25Rem iOmyLink"),
                            new sap.m.HBox({
                                width: "100%",
                                justifyContent: "End",
                                items : [
                                    // -- Example Serial Number -- //
                                    new sap.m.Label({
                                        text: "SN: " + sSerialCode
                                        //text: "SN: " + mLinkInfo.LinkSerialCode
                                    }).addStyleClass("Font-RobotoCondensed TextSizeXSmall Text_grey_20")
                                ]
                            }).addStyleClass("")
                        ]
                    }).addStyleClass("MarLeft3px BorderRight PadRight3px"),
                    new sap.m.VBox({
                        layoutData : new sap.m.FlexItemData({
                            growFactor : 1
                        }),
                        items: [
                            new sap.m.VBox({
                                items : [
                                    new sap.m.Label({
                                        text : "On: " + sOntimeString
                                    }).addStyleClass("Font-RobotoCondensed TextCenter flexgrow1"),
                                    new sap.m.Label({
                                        text : "Off: " + sOfftimeString
                                    }).addStyleClass("Font-RobotoCondensed TextCenter flexgrow1")
                                ]
                            })
                        ]
                    }).addStyleClass("MarTop12px TextCenter minwidth100px")
                ]
            }).addStyleClass("minheight58px ListItem");
        } else {
            throw new SerialCodeNullException();
        }
        
        return wEntryBox;
    },
	
	FetchPermissionsForPremise : function (iUserId, iPremiseId) {
        var me = this;
        var sUrl = IOMy.apiphp.APILocation("permissions");
        
        IOMy.apiphp.AjaxRequest({
            url : sUrl,
            data : {
                "Mode" : "LookupPremisePerms",
                "UserId" : iUserId,
                "PremiseId" : iPremiseId
            },
            
            onSuccess : function (responseType, data) {
                if (data.Error === false) {
					
                }
            },
            
            onFail : function (response) {
                jQuery.sap.log.error("There was an error accessing the premise permissions: "+JSON.stringify(response));
                IOMy.common.showError("There was an error accessing the premise permissions", "Error");
            }
            
        });
    },
	
});