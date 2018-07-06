sap.ui.jsfragment("fragments.DeviceFormEditIPCamera", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oFragContent = null;
		var oView = oController.getView();
		
        var oRoomItemTemplate = new sap.ui.core.Item({
            key : "{RoomId}",
            text : "{RoomName}",
            enabled : "{Enabled}"
        });
        
		//--------------------------------------------//
		//-- 5.0 - CREATE UI                        --//
		//--------------------------------------------//
		oFragContent = new sap.ui.layout.form.Form({
			editable: true,
			layout : new sap.ui.layout.form.ResponsiveGridLayout ({
				labelSpanXL: 3,
				labelSpanL: 3,
				labelSpanM: 3,
				labelSpanS: 12,
				adjustLabelSpan: false,
				emptySpanXL: 3,
				emptySpanL: 2,
				emptySpanM: 0,
				emptySpanS: 0,
				columnsXL: 1,
				columnsL: 1,
				columnsM: 1,
				columnsS: 1,
				singleContainerFullSize: false
			}),
			toolbar : new sap.m.Toolbar({
				content : [
					new sap.m.Title ({
						text: "Device Settings"
					})
				]
			}).addStyleClass("MarBottom1d0Rem"),
			formContainers : [
				new sap.ui.layout.form.FormContainer({
					formElements : [
						new sap.ui.layout.form.FormElement({
                            label : iomy.widgets.RequiredLabel("Device Name"),
                            fields: [
                                new sap.m.Input ({
									placeholder : "Display Name",
                                    enabled : "{/enabled/IfAcceptingInput}",
                                    value : "{/CurrentDevice/ThingName}"
								})
                            ]
                        }),
                        new sap.ui.layout.form.FormElement({
                            label : "Room this device is located in",
                            fields: [
                                new sap.m.Select ({
                                    enabled : "{/enabled/IfRoomsExistAndAcceptingInput}",
                                    selectedKey: "{/CurrentDevice/RoomId}",
                                    items: {
                                        path: "/Rooms",
                                        template: oRoomItemTemplate
                                    }
                                })
                            ]
                        }),
                        new sap.ui.layout.form.FormElement({
							label : "Type",
							fields: [ 
								new sap.m.Select({
                                    enabled : "{/enabled/IfAcceptingInput}",
									selectedKey : "{/CurrentDevice/IPCamType}",
                                    items : {
                                        path : "/IPCamTypes",
                                        template : new sap.ui.core.Item({
                                            key : "{TypeName}",
                                            text : "{TypeName}"
                                        })
                                    }
								})
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : iomy.widgets.RequiredLabel("Network Address"),
							fields: [ 
								new sap.m.Input({
									placeholder: "Enter Protocol",
                                    enabled : "{/enabled/IfAcceptingInput}",
                                    value : "{/CurrentDevice/Protocol}"
								}),
								new sap.m.Input({
									placeholder: "Enter IP Address",
                                    enabled : "{/enabled/IfAcceptingInput}",
                                    value : "{/CurrentDevice/IPAddress}"
								}),
								new sap.m.Input({
									placeholder: "Enter Port Number",
                                    type : "Number",
                                    enabled : "{/enabled/IfAcceptingInput}",
                                    value : "{/CurrentDevice/IPPort}"
								})
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : iomy.widgets.RequiredLabel("Path"),
							fields: [ 
								new sap.m.Input({
									placeholder: "e.g. video",
                                    enabled : "{/enabled/IfAcceptingInput}",
                                    value : "{/CurrentDevice/Path}"
								})
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : "Username",
							fields: [ 
								new sap.m.Input({
									placeholder: "optional",
                                    enabled : "{/enabled/IfAcceptingInput}",
                                    value : "{/CurrentDevice/Username}"
								})
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : "Password",
							fields: [ 
								new sap.m.Input({
									placeholder: "optional",
                                    type : sap.m.InputType.Password,
                                    enabled : "{/enabled/IfAcceptingInput}",
                                    value : "{/CurrentDevice/Password}"
								})
							]
						}),
                        new sap.ui.layout.form.FormElement({
							label : "",
							fields: [ 
								new sap.m.Button ({
									type: sap.m.ButtonType.Accept,
									text: "Save",
                                    enabled : "{/enabled/IfAcceptingInput}",
                                    press : function () {
                                        oController.EditDevice();
                                    }
								}),
								new sap.m.Button ({
									type: sap.m.ButtonType.Reject,
									text: "Cancel",
                                    enabled : "{/enabled/Always}",
                                    press : function () {
                                        oController.CancelInput();
                                    }
								})
							]
						})
					]
				})
			]
		});
							
		//--------------------------------------------//
		//-- 9.0 - RETURN FORM                      --//
		//--------------------------------------------//
		return oFragContent;
	}
	
});