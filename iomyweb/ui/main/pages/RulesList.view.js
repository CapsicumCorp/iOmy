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
sap.ui.jsview("pages.RulesList", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf pages.UserSettings
	****************************************************************************************************/ 
	getControllerName : function() {
		return "pages.RulesList";
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
		
		var oColRName = new sap.m.Text ({
			text : "{RuleName}"
		});
		
		var oColRState = new sap.m.Text ({
			text : "{RuleState}"
		});
		
		var oColEType = new sap.m.Text ({
			text : "{EventType}"
		});
		
		var oColETime = new sap.m.Text ({
			text : "{EventTime}"
		});
		
		var oColEdit = new sap.m.Button ({
			icon: "sap-icon://edit",
			text: "Edit",
			type: "Transparent",
			width: "100%",
            enabled : "{/ControlButtonsEnabled}",
			press : function (oEvent) {
				iomy.common.NavigationChangePage( "pRulesForm" , {
                    "RuleId" : oEvent.getSource().getBindingContext().getProperty("RuleId")
                }, false);
			}
		});
		
        return new sap.tnt.ToolPage(oView.createId("toolPage"), {
			title: "Rules List",
			header : iomy.widgets.getToolPageHeader(oController),
			sideContent : iomy.widgets.getToolPageSideContent(oController),
			mainContents: [
                new sap.m.ScrollContainer ({
					width: "100%",
					height: "100%",
					vertical : true,
					content : [
                        new sap.ui.table.Table (oView.createId("RulesTable"), {
                            rows: "{/RulesList}",
                            extension : [
                                new sap.m.Toolbar ({
                                    selectionMode:"MultiToggle",
                                    content : [
                                        new sap.m.Button (oView.createId("ButtonAdd"), {
                                            text: "Add",
                                            type: sap.m.ButtonType.Accept,
                                            enabled : "{/ControlButtonsEnabled}",
                                            press : function () {
                                                iomy.common.NavigationChangePage( "pRulesForm" ,  {"bEditing": false} , false);
                                            }
                                        }),
                                        new sap.m.Button(oView.createId("ButtonDiscard"), {
                                            text: "Discard",
                                            type: sap.m.ButtonType.Reject,
                                            enabled : "{/ControlButtonsEnabled}",
                                            press : function () {
                                            	oController.DiscardRule();
                                            }
                                        }),
										 new sap.m.Button(oView.createId("ButtonToggle"), {
                                            text: "Toggle",
                                            type: sap.m.ButtonType.Default,
                                            enabled : "{/ControlButtonsEnabled}",
                                            press : function () {
                                                oController.toggleRuleStates();
                                            }
                                        }),
                                        new sap.m.ToolbarSpacer({}),
                                        new sap.m.ToolbarSpacer({}),
                                        new sap.m.ToolbarSpacer({}),
                                        new sap.m.ToolbarSpacer({}),
                                        new sap.m.Title ({
                                            id: "RulesList" ,
                                            text: "Rules"
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
                                        text:"Rule Name" 
                                    }),
                                    template : oColRName
                                }),
                                new sap.ui.table.Column ({
                                    label : new sap.m.Label({ 
                                        text:"Rule State" 
                                    }),
                                    template : oColRState
                                }),
                                new sap.ui.table.Column ({
                                    label : new sap.m.Label({ 
                                        text:"Event Type" 
                                    }),
                                    template : oColEType
                                }),
                                new sap.ui.table.Column ({
                                    label : new sap.m.Label({ 
                                        text:"Event Time" 
                                    }),
                                    template : oColETime
                                }),
                                new sap.ui.table.Column ({
                                    width: "11rem",
                                    label : new sap.m.Label({ 
                                        text:"Edit" 
                                    }),
                                    template : oColEdit
                                })
                            ]
                        })
					]
				})
                        
			]
		}).addStyleClass("MainBackground");
	}
});