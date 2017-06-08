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
	
	sStreamUrl				: null,
	
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
				
				me.sStreamUrl = evt.data.StreamUrl;
				
				if (me.wMPEGImage !== null) {
					me.wMPEGImage.setSrc(me.sStreamUrl);
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
		this.DrawUI();
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
	
	DrawUI : function () {
		var me = this;
		var oView		= me.getView();
		
		try {
			//-- Draw the Image with the video stream as its source. --//
			me.wMPEGImage = new sap.m.Image ({
				src : me.sStreamUrl,
				densityAware : false,
				decorative : false,
				alt : "Failed to load stream",
				error : function () {
					IOMy.common.showMessage("Failed to load stream");
				}
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
		} catch (ex) {
			IOMy.common.showMessage("Failed to load stream: "+ex.message);
		}
		
		oView.byId("page").addContent(me.wPanel);
	}
	
});