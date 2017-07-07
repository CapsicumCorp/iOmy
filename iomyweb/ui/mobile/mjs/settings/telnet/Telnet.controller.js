/*
Title: Telnet Page Controller
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
	Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: Defines the functions for the widgets that interact with the telnet
	library.
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

sap.ui.controller("mjs.settings.telnet.Telnet", {
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.settings.telnet.Telnet
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
			}
		});
	},
	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.telnet.Telnet
*/
	onBeforeRendering: function() {

	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.telnet.Telnet
*/
	onAfterRendering: function() {

	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.telnet.Telnet
*/
	onExit: function() {

	},
	
	/**
	 * Force the telnet output text area to scroll all the way to the bottom.
	 */
	ScrollTextAreaToBottom : function () {
		var me			= this;
		var oView		= me.getView();
		
		// Force it to scroll down to the bottom.
		try {
			document.getElementById(oView.createId("telnetOutput-inner")).scrollTop = document.getElementById(oView.createId("telnetOutput-inner")).scrollHeight;
		} catch (error) {
			jQuery.sap.log.error(error.name + ": " +error.message);
		}
	},
	
	/**
	 * Displays output to the screen.
	 */
	AppendOutput : function () {
		var me			= this;
		var oView		= me.getView();
		
		oView.wTextAreaOutput.setValue(
			IOMy.telnet.compileLog().join("\n------------------------------------\n")
		);
		me.ScrollTextAreaToBottom();
	},
	
	/**
	 * Sends the telnet command to the telnet module to execute. Displays output
	 * on the screen afterwards.
	 * 
	 * @param {type} sCommand		Telnet command
	 */
	ExecuteCommand : function (sCommand) {
		var me = this;
		
		IOMy.telnet.RunCommand({
			command : sCommand,
			
			onSuccess : function () {
				me.AppendOutput();
			},
			
			onFail : function (sOutput, sErrorMessage) {
				me.AppendOutput(sOutput);
				jQuery.sap.log.error(sErrorMessage);
			}
		});
	}
	
});