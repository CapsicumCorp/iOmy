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
sap.ui.jsview("pages.streams.ManagedStreams", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf pages.streams.ManagedStream
	****************************************************************************************************/ 
	getControllerName : function() {
		return "pages.streams.ManagedStreams";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf pages.streams.ManagedStream
	****************************************************************************************************/ 
	createContent : function(oController) {
		var oView = this;
		
		var oColDName = new sap.m.Text ({
			text : "{DeviceName}"			
		});
		
		var oColDesc = new sap.m.Text ({
			text : "{Descript}"
		});
		
		var oColFail = new sap.m.Text ({
			text : "{Fail}"
		});
        
        var oColSuccess = new sap.m.Text ({
			text : "{Success}"
		});
		
		var oColState = new sap.m.Text ({
			text : "{State}"
		});
		
		var oColEdit = new sap.m.Button ({
			icon: "sap-icon://edit",
			type: "Transparent",
			width: "100%",
            enabled : "{/controlsEnabled/Always}",
            press : function (oEvent) {
                var mThing = oEvent.getSource().getBindingContext().getProperty(""); // Get the relevant model data.
                
                iomy.common.NavigationChangePage( "pAddStream" ,  {
                    Stream : mThing
                } , false);
            }
		});
		
		var oColView = new sap.m.Button ({
			icon: "sap-icon://show",
			type: "Transparent",
			width: "100%",
            enabled : "{/controlsEnabled/Always}",
            press : function (oEvent) {
                var iThingId = oEvent.getSource().getBindingContext().getProperty("ThingId");
                //iomy.devices.onvif.loadStream(iThingId);
                
                iomy.common.NavigationChangePage("pFFMPEG", {"ThingId" : iThingId});
            }
		});
		
        return new sap.tnt.ToolPage(oView.createId("toolPage"), {
			title: "Managed Cameras",
			header : iomy.widgets.getToolPageHeader(oController),
			sideContent : iomy.widgets.getToolPageSideContent(oController),
			mainContents: [ 
				new sap.m.ScrollContainer ({
                    width : "100%",
                    height : "100%",
                    vertical : true,
                    content :[
                        new sap.ui.table.Table (oView.createId("streamTable"), {
                            rows: "{/CameraList}",
                            extension : [
                                new sap.m.Toolbar ({
                                    selectionMode:"MultiToggle",
                                    content : [
                                        new sap.m.Button ({
                                            text: "Add",
                                            type: sap.m.ButtonType.Accept,
                                            press:   function( oEvent ) {
                                                var aStreams        = iomy.devices.onvif.getListOfOnvifStreams();
                                                var iStreamCount    = aStreams.length;

                                                if (iStreamCount > 0) {
                                                    iomy.common.NavigationChangePage("pAddStream",  {} , false);
                                                } else {
                                                    iomy.common.showInformation("You need to create an Onvif stream first to manage one.", "No Onvif Streams.");
                                                }
                                            }
                                        }),
                                        new sap.m.Button({
                                            enabled : "{/controlsEnabled/IfStreamsExist}",
                                            text: "Toggle",
                                            type: sap.m.ButtonType.Default,

                                            press : function () {
                                                oController.toggleSelectedStreams();
                                            }
                                        }),

                                        new sap.m.ToolbarSpacer({}),
                                        new sap.m.ToolbarSpacer({}),
                                        new sap.m.ToolbarSpacer({}),
                                        new sap.m.ToolbarSpacer({}),
                                        new sap.m.Title ({
                                            id: "toolbarTitle" ,
                                            text: "Managed Cameras"
                                        }),
                                        new sap.m.ToolbarSpacer({}),
                                        new sap.m.ToolbarSpacer({}),
                                        new sap.m.ToolbarSpacer({}),
                                        new sap.m.ToolbarSpacer({}),
                                        new sap.m.Button({
                                            enabled : "{/controlsEnabled/IfStreamsExist}",
                                            text: "Stop All Streams",
                                            type: sap.m.ButtonType.Reject,

                                            press : function () {
                                                oController.stopAllStreams();
                                            }
                                        }),
                                    ]
                                })
                            ],
                            columns : [
                                new sap.ui.table.Column ({
                                    minWidth: 200,
                                    width: "auto",
                                    label : new sap.m.Label({ 
                                        text:"Device Name" 
                                    }),
                                    template : oColDName
                                }),
                                new sap.ui.table.Column ({
                                    minWidth: 200,
                                    width: "auto",
                                    label : new sap.m.Label({ 
                                        text:"Description" 
                                    }),
                                    template : oColDesc
                                }),
                                new sap.ui.table.Column ({
                                    minWidth: 200,
                                    width: "auto",
                                    label : new sap.m.Label({ 
                                        text:"Status" 
                                    }),
                                    template : oColState
                                }),
                                new sap.ui.table.Column ({
                                    width: "7rem",
                                    label : new sap.m.Label({ 
                                        text:"Successful" 
                                    }),
                                    template : oColSuccess
                                }),
                                new sap.ui.table.Column ({
                                    width: "7rem",
                                    label : new sap.m.Label({ 
                                        text:"Failed" 
                                    }),
                                    template : oColFail
                                }),
                                new sap.ui.table.Column ({
                                    width: "4rem",
                                    label : new sap.m.Label({ 
                                        text:"View" 
                                    }),
                                    template : oColView
                                }),
                                new sap.ui.table.Column ({
                                    width: "4rem",
                                    label : new sap.m.Label({ 
                                        text:"Edit" 
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