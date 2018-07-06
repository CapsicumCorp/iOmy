sap.ui.jsfragment("fragments.DeviceFormEdit", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
        var oView = oController.getView();
        
        var oRoomItemTemplate = new sap.ui.core.Item({
            key : "{RoomId}",
            text : "{RoomName}",
            enabled : "{Enabled}"
        });
        
		var oFragContent = new sap.ui.layout.form.Form( oView.createId("DevTypeBlock_Form"),{
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
                        text: "Display Name and Location"
                    })
                ]
            }).addStyleClass("MarBottom1d0Rem"),
            formContainers : [
                new sap.ui.layout.form.FormContainer({
                    formElements : [
                        new sap.ui.layout.form.FormElement({
                            label : iomy.widgets.RequiredLabel("Device Name"),
                            fields: [
                                new sap.m.Input (oView.createId("DeviceName"), {
									placeholder : "Display Name",
                                    value : "{/CurrentDevice/ThingName}",
                                    enabled : "{/enabled/Always}",
                                    
                                    liveChange : function () {
                                        oController.ToggleSubmitButton();
                                    }
								})
                            ]
                        }),
                        new sap.ui.layout.form.FormElement(oView.createId("EditThingRoomSelector"), {
                            label : "Room this device is located in",
                            fields: [
                                new sap.m.Select (oView.createId("DeviceRoom"), {
                                    selectedKey: "{/CurrentDevice/RoomId}",
                                    enabled : "{/enabled/Always}",
                                    
                                    items: {
                                        path: "/Rooms",
                                        template: oRoomItemTemplate
                                    },
                                    
                                    change : function () {
                                        oController.ToggleSubmitButton();
                                    }
                                })
                            ]
                        }),
                        new sap.ui.layout.form.FormElement({
							label : "",
							fields: [ 
								new sap.m.Button (oView.createId("ButtonSubmit"), {
									type: sap.m.ButtonType.Accept,
									text: "Save",
                                    enabled : "{/enabled/IfSettingsChanged}",
                                    press : function () {
                                        oController.EditDevice();
                                    }
								}),
								new sap.m.Button (oView.createId("ButtonCancel"), {
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