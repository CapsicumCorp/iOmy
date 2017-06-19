/*
Title: Add IP Camera
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: 
Copyright: Capsicum Corporation 2016
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

sap.ui.jsview("mjs.settings.devices.AddCamera", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.settings.devices.AddCamera
	****************************************************************************************************/ 
	getControllerName : function() {
		return "mjs.settings.devices.AddCamera";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.settings.devices.AddCamera
	****************************************************************************************************/ 
	createContent : function(oController) {
		var me = this;
		
		var oPage = new IOMy.widgets.IOMyPage({
            view : me,
            controller : oController,
            icon : "sap-icon://GoogleMaterial/camera",
            title : "New Camera"
        });

		oPage.addContent(
            //-- Main Panel --//
            new sap.m.Panel ({
                backgroundDesign: "Transparent",
                content : [
					new sap.m.List({
						headerText : "Supported Apps / Devices",
						items : [
							new sap.m.ObjectListItem ({
								title:"IP Webcam",
								iconDensityAware : false,
								icon: "resources/images/logo/IP_Webcam.png",
								type:"Navigation",
								press : function () {
									IOMy.common.NavigationChangePage( "pSettingsAddIPC" , {} , false);
								},
								firstStatus : new sap.m.ObjectStatus ({
									text : "App",
								}),
								attributes : [
									new sap.m.ObjectAttribute ({ 
									title : "by",
									text : "Pavel Khelbovich",
									})
								], 	
							}).addStyleClass(""),
							new sap.m.ObjectListItem ({
								title:"Onvif",
								iconDensityAware : false,
								icon: "resources/images/logo/onvif.png",
								type:"Navigation",
								press : function () {
									IOMy.common.NavigationChangePage( "pSettingsLinkAdd" , { "LinkTypeId" : IOMy.devices.onvif.LinkTypeId } , false);
								},
								firstStatus : new sap.m.ObjectStatus ({
									text : "Device",
								}),
								attributes : [
									new sap.m.ObjectAttribute ({ 
										title : "by",
										text : "www.onvif.org",
									})
								], 	
							}).addStyleClass(""),
						],
					}).addStyleClass("PadLeft7px PadRight7px"),
				],
			}).addStyleClass("PadBottom10px PanelNoPadding UserInputForm")
		);
		return oPage;
	}

});