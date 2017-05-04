/*
Title: Template UI5 Controller
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

sap.ui.controller("mjs.rules.AddRule", {
    
    aElementsToDestroy      : [],
    
    wDisplayName               : null,
    wOnTime                 : null,
    wOffTime                : null,
    wCancelButton           : null,
    wApplyButton            : null,
    wDiscardButton          : null,
    wPanel                  : null,
    
    iThingId                : 0,
    bEditing                : false,
    
    destroyItemsWithIDs     : IOMy.functions.destroyItemsByIdFromView,
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.rules.AddRule
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
                
                me.iThingId = evt.data.ThingId;
                me.bEditing = evt.data.editing;
                
                me.DestroyUI();
                me.DrawUI();
			}
		});
	},
	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.rules.AddRule
*/
	onBeforeRendering: function() {

	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.rules.AddRule
*/
	onAfterRendering: function() {

	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.rules.AddRule
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
        var me					= this;
        var thisView			= me.getView();
		var aButtonHBoxItems	= [];
		
        //--------------------------------------------------------------------//
        // Fields
        //--------------------------------------------------------------------//
        //-- Rule Display Name --//
        me.wDisplayName = new sap.m.Input ({
            layoutData : new sap.m.FlexItemData({
                growFactor : 1
            }),
			value : IOMy.common.ThingList["_"+me.iThingId].DisplayName,
			enabled : false
        });
        
        //-- When the device should turn on --//
        me.wOnTime = new sap.m.TimePicker ({
            //id: "TP1",
            valueFormat: "hh:mm",
            displayFormat: "hh:mm a",
            placeholder: "Select an On Time",
            change: function () {}
        }).addStyleClass("width100Percent IOMyTimePicker");
        
        //-- When the device should turn off --//
        me.wOffTime = new sap.m.TimePicker ({
            //id: "TP2",
            valueFormat: "hh:mm",
            displayFormat: "hh:mm a",
            placeholder: "Select an Off Time",
            change: function () {}
        }).addStyleClass("width100Percent IOMyTimePicker");
        
        //--------------------------------------------------------------------//
        // Buttons
        //--------------------------------------------------------------------//
        me.wCancelButton = new sap.m.Button({
            layoutData : new sap.m.FlexItemData({
                growFactor : 1
            }),
            type:"Default",
            text: "Cancel",
			press: function () {
				me.cancelChanges();
			}
        }).addStyleClass("width80px");
        
        me.wApplyButton = new sap.m.Button({
            layoutData : new sap.m.FlexItemData({
                growFactor : 1
            }),									
            type:"Accept",
            text: "Apply",
            
            press : function () {
                me.saveRule();
            }
        }).addStyleClass("width80px");
		
		aButtonHBoxItems = [
			me.wCancelButton,
			me.wApplyButton
		];
		
		if (me.bEditing) {
			me.wDiscardButton = new sap.m.Button({
				layoutData : new sap.m.FlexItemData({
					growFactor : 1
				}),									
				type:"Reject",
				text: "Discard",

				press : function () {
					me.deleteRule();
				}
			}).addStyleClass("width80px");
			
			aButtonHBoxItems.push(me.wDiscardButton);
		}
        
        //--------------------------------------------------------------------//
        // Draw the main panel
        //--------------------------------------------------------------------//
        me.wPanel = new sap.m.Panel ({
            backgroundDesign: "Transparent",
            content: [
                new sap.m.VBox ({
                    items : [
                        new sap.m.Label ({
                            text: "Display Name"
                        }),
                        me.wDisplayName
                    ]
                }),
                new sap.m.HBox ({	
                    items : [
                        new sap.m.VBox ({
                            layoutData : new sap.m.FlexItemData({
                                growFactor : 1
                            }),
                            items : [
                                new sap.m.Label ({
                                    text: "On Time"
                                }),
                                me.wOnTime
                            ]
                        }).addStyleClass("MarRight10px"),
                        new sap.m.VBox ({
                            layoutData : new sap.m.FlexItemData({
                                growFactor : 1
                            }),
                            items : [
                                new sap.m.Label ({
                                    text: "Off Time"
                                }),
                                me.wOffTime
                            ]
                        }).addStyleClass("MarLeft10px")
                    ]
                }).addStyleClass("MarTop10px"),
                new sap.m.HBox ({	
                    layoutData : new sap.m.FlexItemData({
                        growFactor : 1
                    }),
                    items : aButtonHBoxItems
                }).addStyleClass("MarTop15px TextCenter")
            ]
        }).addStyleClass("PadBottom10px UserInputForm MarTop3px");
        
        thisView.byId("page").addContent(me.wPanel);
        
        if (me.bEditing === true) {
            me.loadRule();
        }
    },
	
	cancelChanges : function () {
		IOMy.common.NavigationTriggerBackForward();
	},
    
    loadRule : function () {
        var me          = this;
        var mThing      = IOMy.common.ThingList["_"+me.iThingId];
        var sSerialCode = IOMy.common.getLink(mThing.LinkId).LinkSerialCode;
        var mRule       = IOMy.rules.RulesList[sSerialCode];
        
        me.wOnTime.setDateValue( IOMy.time.GetDateFromMilitaryTime(mRule.Ontime) );
        me.wOffTime.setDateValue( IOMy.time.GetDateFromMilitaryTime(mRule.Offtime) );
        
    },
    
    saveRule : function () {
        var me				= this;
		var bError			= false;
		var aErrorMessages	= [];
        var mThing			= IOMy.common.ThingList["_"+me.iThingId];
        var sSerialCode		= IOMy.common.getLink(mThing.LinkId).LinkSerialCode;
        
		if (me.wOnTime.getDateValue() === null) {
			
		}
		
        var mRule = {
            "Type" : "DeviceTimeRule",
            "Serial" : sSerialCode,
            //"Serial" : "009483746873",
            "Ontime" : IOMy.time.GetMilitaryTimeFromDate(me.wOnTime.getDateValue()),
            "Offtime" : IOMy.time.GetMilitaryTimeFromDate(me.wOffTime.getDateValue()),
        };
        
        IOMy.rules.applyRule({
            rule : mRule,
            hubID : 1,
            
            onSuccess : function () {
                IOMy.common.showSuccess("Rule for "+mThing.DisplayName+" was successfully applied.", "Success");
				IOMy.common.NavigationChangePage( "pRuleDeviceList", {}, true);
            },
            
            onFail : function (sError) {
                IOMy.common.showError("Rule for "+mThing.DisplayName+" could not be applied.\n\n"+sError, "Success");
            }
        });
        
    },
    
    deleteRule : function () {
        var me          = this;
        var mThing      = IOMy.common.ThingList["_"+me.iThingId];
        var sSerialCode = IOMy.common.getLink(mThing.LinkId).LinkSerialCode;
        
        IOMy.common.showConfirmQuestion("Are you sure you wish to discard this rule?", "",
            function () {
				try {
					IOMy.rules.discardRule({
						hubID : 1,
						Serial : sSerialCode,

						onSuccess : function () {
							IOMy.common.showSuccess("Rule for "+mThing.DisplayName+" was successfully removed.", "Success");
							IOMy.common.NavigationChangePage( "pRuleDeviceList", {}, true);
						},

						onFail : function (sError) {
							IOMy.common.showError("Rule for "+mThing.DisplayName+" could not be removed.\n\n"+sError, "Success");
						}
					});
				} catch (error) {
					IOMy.common.showError("Rule for "+mThing.DisplayName+" could not be removed.\n\n"+error.message, "Success");
				}
            }
        );
    }
	
});