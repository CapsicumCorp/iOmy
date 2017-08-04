/*
Title: Permission Overhaul
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: Gives an example page for UI5 Control Objects
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

sap.ui.jsview("mjs.staging.PermissionOverhaul", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.template.Template
	****************************************************************************************************/ 
	getControllerName : function() {
		return "mjs.staging.PermissionOverhaul";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.template.Template
	****************************************************************************************************/ 
	createContent : function(oController) {
		var me = this;
		
		//var oPage = new sap.m.Page(me.createId("page"),{
		//	customHeader : IOMy.widgets.getIOMYPageHeaderNav( oController ),
		//	footer : IOMy.widgets.getAppFooter(),
		//	content : [
        //       //-- Navigational Header --//
		//		IOMy.widgets.getNavigationalSubHeader("Template", "sap-icon://GoogleMaterial/home", me)
        //    ]
		// }).addStyleClass("height100Percent width100Percent MainBackground");
		
		 var oPage = new IOMy.widgets.IOMyPage({
            view : me,
            controller : oController,
            icon : "sap-icon://GoogleMaterial/home",
            title : "Permissions"
        });
        
        oPage.addContent(
			new sap.ui.layout.form.Form({
				editable: true,
				title : "Premise Permissions",
				layout : new sap.ui.layout.form.ResponsiveGridLayout ({
					labelSpanXL: 4,
					labelSpanL: 3,
					labelSpanM: 4,
					labelSpanS: 12,
					adjustLabelSpan: false,
					emptySpanXL: 0,
					emptySpanL: 4,
					emptySpanM: 0,
					emptySpanS: 0,
					columnsXL: 2,
					columnsL: 1,
					columnsM: 1,
					singleContainerFullSize: false
				}),
				formContainers : [
					new sap.ui.layout.form.FormContainer({
						formElements : [
							new sap.ui.layout.form.FormElement({
								label : "User",
								fields: [
									new sap.m.Select ({
										items: [
											new sap.ui.core.Item ({
												text: "Freshwater Office",
											}),
											new sap.ui.core.Item({
												text: "Office Manager",
											}),
											new sap.ui.core.Item({
												text: "Receptionist",
											}),
											new sap.ui.core.Item({
												text: "Shitkicker",
											})
										]
									})
								]
							}),
							new sap.ui.layout.form.FormElement({
								label : "Premise",
								fields: [
									new sap.m.Select ({
										items: [
											new sap.ui.core.Item ({
												text: "Freshwater Home",
											}),
											new sap.ui.core.Item({
												text: "Islander Road Office",
											}),
											new sap.ui.core.Item({
												text: "Display Home",
											}),
										]
									})
								]
							}),
							new sap.ui.layout.form.FormElement({
								label : "Permission Level",
								fields: [
									new sap.m.Slider ({
										enableTickmarks: true,
										min: 0,
										max: 3,
									})
								]
							}),
							new sap.ui.layout.form.FormElement({
								label : "",
								fields: [
									new sap.m.Label ({
										text: "0: No Access,   1: Read,   2: Write,   3: Room Admin",
									}).addStyleClass("MarTop5px pre-wrap")
								]
							}),
							new sap.ui.layout.form.FormElement({
								fields: [
									new sap.m.FlexBox ({
										height:"100px",
										alignItems:"Center",
										justifyContent:"End",
										items: [
											new sap.m.Button({
												text: "Submit",
												type: "Accept",
												press : function () {
													IOMy.common.NavigationChangePage( "pDeviceOverview", {} , false);
												},
											}),
											new sap.m.Button({
												text: "Cancel",
												type: "Reject",
												press : function () {
													IOMy.common.NavigationChangePage( "pDeviceOverview", {} , false);
												},
											}).addStyleClass("MarLeft15px"),
										]
									})
								]
							}),
						]
					})	
				]
			})
        )
		return oPage;
	}
});