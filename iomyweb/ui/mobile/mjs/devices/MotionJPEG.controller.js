/*
Title: Motion JPEG Device Page (Controller)
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
	Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Shows the stream of a webcam in Motion JPEG format.
Copyright: Capsicum Corporation 2017

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

sap.ui.controller("mjs.devices.MotionJPEG", {
	
	wMPEGImage				: null,
	wPanel					: null,
	
	aElementsToDestroy		: [],
	
	iThingId				: 0,
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.devices.MotionJPEG
*/

	onInit: function() {
		var me = this;			//-- SCOPE: Allows subfunctions to access the current scope --//
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			onBeforeShow : function (evt) {
				
				//-- Refresh the Navigational buttons --//
				IOMy.common.NavigationRefreshButtons( me );
				
				me.byId("NavSubHead_Title").setText( IOMy.common.ThingList["_"+evt.data.ThingId].DisplayName.toUpperCase() );
				
				me.iThingId = evt.data.ThingId;
				
				me.DestroyUI();
				me.DrawUI();
				
				me.wPanel.setVisible(false);
				thisView.byId("page").addContent(
					IOMy.common.showLoading({
						"show" : true,
						"context" : me
					})
				);
				
				try {
					IOMy.devices.ipcamera.loadStreamUrl({
						thingID : evt.data.ThingId,

						onSuccess : function (sUrl) {
							if (me.wMPEGImage !== null) {
								me.wMPEGImage.attachError(
									function () {
										IOMy.common.showMessage({
											text : "Failed to load stream.",
											view : thisView
										});
									}
								);
								
								me.wPanel.setVisible(true);
								IOMy.common.showLoading({
									"show" : false,
									"context" : me
								});
								
								me.wMPEGImage.setSrc(sUrl);
							}
						},

						onFail : function (sErrorMessage) {
							me.wPanel.setVisible(true);
							IOMy.common.showLoading({
								"show" : false,
								"context" : me
							});
							
							IOMy.common.showMessage({
								text : "Failed to load stream: "+sErrorMessage,
								view : thisView
							});
						}
					});
				} catch (ex) {
					IOMy.common.showMessage({
						text : "Failed to load stream: "+ex.message,
						view : thisView
					});
					
					me.wPanel.setVisible(true);
					IOMy.common.showLoading({
						"show" : false,
						"context" : me
					});
				}
				
			}
		});
	},
	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.devices.MotionJPEG
*/
	onBeforeRendering: function() {

	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.devices.MotionJPEG
*/
	onAfterRendering: function() {
		
	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.devices.MotionJPEG
*/
	onExit: function() {
		this.wPanel.destroy();
		this.wPanel = null;
		
		this.wMPEGImage.destroy();
		this.wMPEGImage = null;
	},
	
	/**
     * Procedure that destroys the previous incarnation of the UI. Must be called by onInit before
     * (re)creating the page.
     */
    DestroyUI : function() {
        var me          = this;
        var sCurrentID  = "";
        
        for (var i = 0; i < me.aElementsToDestroy.length; i++) {
            sCurrentID = me.aElementsToDestroy[i];
            if (me.byId(sCurrentID) !== undefined) {
                me.byId(sCurrentID).destroy();
            }
        }
        
        if (me.wPanel !== null) {
            me.wPanel.destroy();
        }
        
        // Clear the array
        me.aElementsToDestroy = [];
    },
	
	DrawUI : function () {
		//--------------------------------------------------------------------//
        // Capture contexts
        //--------------------------------------------------------------------//
		var me			= this;
		var oView		= me.getView();
		
		//--------------------------------------------------------------------//
        // Create the widgets.
        //--------------------------------------------------------------------//
		
		//-- Draw the Image with the video stream as its source. --//
		me.wMPEGImage = new sap.m.Image ({
			//src : me.sStreamUrl,
			densityAware : false,
			decorative : false,
			alt : "Failed to load stream"
		}).addStyleClass("MJPEG");

		//-- Main Panel --//
		me.wPanel = new sap.m.Panel ({
			backgroundDesign: "Transparent",
			content: [
				new sap.m.VBox ({
					items : [
						me.wMPEGImage
					]
				})
			]
		}).addStyleClass("PadBottom10px MotionJPEG MarTop3px");
		
		oView.byId("page").addContent(me.wPanel);
		
		//--------------------------------------------------------------------//
        // Build the action menu.
        //--------------------------------------------------------------------//
        try {
            oView.byId("extrasMenuHolder").destroyItems();
            oView.byId("extrasMenuHolder").addItem(
                IOMy.widgets.getActionMenu({
                    id : me.createId("extrasMenu"+me.iThingId),        // Uses the page ID
                    icon : "sap-icon://GoogleMaterial/more_vert",
                    items : [
                        {
                            text: "Edit " + IOMy.common.ThingList["_"+me.iThingId].DisplayName,
                            select:	function (oControlEvent) {
                                IOMy.common.NavigationChangePage( "pSettingsEditThing", {"ThingId" : me.iThingId}, false );
                            }
                        },
                        {
                            text: "Edit Connection Settings",
                            select:	function (oControlEvent) {
                                IOMy.common.NavigationChangePage( "pSettingsAddIPC", {"ThingId" : me.iThingId}, false );
                            }
                        }
                    ]
                })
            );
        } catch (e) {
            jQuery.sap.log.error("Error drawing the action menu: "+e.message);
        }
	}
	
});