/*
Title: Template UI5 View
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: Creates the page list all devices and their information in a given
    room.
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
$.sap.require("sap.ui.table.Table");
sap.ui.jsview("pages.user.UserList", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf pages.UserSettings
	****************************************************************************************************/ 
	getControllerName : function() {
		return "pages.user.UserList";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf pages.UserSettings
	****************************************************************************************************/ 
	createContent : function(oController) {
		var oView = this;
		
		var oColUName = new sap.m.Text ({
			text : "{Username}"			
		});
		
		var oColFName = new sap.m.Text ({
			text : "{FirstName}"
		});
		
		var oColLName = new sap.m.Text ({
			text : "{LastName}"
		});
		
		var oColDName = new sap.m.Text ({
			text : "{DisplayName}"
		});
		
		var oColStatus = new sap.m.Text ({
			text : "{Status}"
		});
		
		var oColEdit = new sap.m.Button ({
			icon: "sap-icon://edit",
			text: "Edit",
			type: "Transparent",
			width: "100%",
            enabled : "{/enabled/Always}",
			press : function (oEvent) {
				iomy.common.NavigationChangePage( "pUserForm" , {
                    "userID" : oEvent.getSource().getBindingContext().getProperty("UserId"),
                    "bPageType": true
                } , false);
			}
		});
		
        return new sap.tnt.ToolPage(oView.createId("toolPage"), {
			title: "User Settings",
			header : iomy.widgets.getToolPageHeader(oController),
			sideContent : iomy.widgets.getToolPageSideContent(oController),
			mainContents: [
                new sap.m.ScrollContainer ({
					width: "100%",
					height: "100%",
					vertical : true,
					content : [
                        new sap.ui.table.Table (oView.createId("UsersTable"), {
                            rows: "{/UserList}",
                            extension : [
                                new sap.m.Toolbar ({
                                    selectionMode:"MultiToggle",
                                    content : [
                                        new sap.m.Button ({
                                            text: "Enable",
                                            type: sap.m.ButtonType.Accept,
                                            enabled : "{/enabled/Always}",

                                            press : function () {
                                                oController.EnableSelectedUsers();
                                            }
                                        }),
                                        new sap.m.Button({
                                            text: "Disable",
                                            type: sap.m.ButtonType.Reject,
                                            enabled : "{/enabled/Always}",

                                            press : function () {
                                                oController.DisableSelectedUsers();
                                            }
                                        }),
                                        new sap.m.ToolbarSpacer({}),
                                        new sap.m.ToolbarSpacer({}),
                                        new sap.m.ToolbarSpacer({}),
                                        new sap.m.ToolbarSpacer({}),
                                        new sap.m.Title ({
                                            id: "UserList" ,
                                            text: "Users"
                                        }),
                                        new sap.m.ToolbarSpacer({}),
                                        new sap.m.ToolbarSpacer({}),
                                        new sap.m.ToolbarSpacer({}),
                                        new sap.m.ToolbarSpacer({}),
                                        new sap.m.ToolbarSpacer({})
                                    ]
                                })
                            ],
                            columns : [
                                new sap.ui.table.Column ({
                                    label : new sap.m.Label({ 
                                        text:"User Name" 
                                    }),
                                    template : oColUName
                                }),
                                new sap.ui.table.Column ({
                                    label : new sap.m.Label({ 
                                        text:"Given Names" 
                                    }),
                                    template : oColFName
                                }),
                                new sap.ui.table.Column ({
                                    label : new sap.m.Label({ 
                                        text:"Last Name" 
                                    }),
                                    template : oColLName
                                }),
                                new sap.ui.table.Column ({
                                    label : new sap.m.Label({ 
                                        text:"Display Name" 
                                    }),
                                    template : oColDName
                                }),
                                new sap.ui.table.Column ({
                                    width: "11rem",
                                    label : new sap.m.Label({ 
                                        text:"Status" 
                                    }),
                                    template : oColStatus
                                }),
                                new sap.ui.table.Column ({
                                    width: "11rem",
                                    label : new sap.m.Label({ 
                                        text:"Editing" 
                                    }),
                                    template : oColEdit
                                }),
                            ],
                        })
					]
				})
			]
		}).addStyleClass("MainBackground");
	}
});