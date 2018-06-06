sap.ui.jsfragment("fragments.OpenWeatherMap", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oFragContent = null;
		var oView = oController.getView();
		
		//--------------------------------------------//
		//-- 5.0 - CREATE UI                        --//
		//--------------------------------------------//
		oFragContent = new sap.ui.layout.form.Form( oView.createId("DevSettingsBlock_Form"),{
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
						text: "Device Settings",
					})
				]
			}).addStyleClass("MarBottom1d0Rem"),
			formContainers : [
				new sap.ui.layout.form.FormContainer({
					formElements : [
						new sap.ui.layout.form.FormElement({
							label : "Hub",
							fields: [ 
								iomy.widgets.selectBoxHub(oView.createId("HubSelect"), {
                                    selectedKey : "{/"+oView.byId("DevTypeSelect").getSelectedKey()+"/Hub}",
                                    enabled : "{/enabled/Always}",
                                    template : {
                                        path : "/Hubs",
                                        item : new sap.ui.core.Item({
                                            key : "{HubId}",
                                            text : "{HubName}"
                                        })
                                    },
                                    
                                    change : function () {
                                        oController.SetPremise();
                                    }
                                })
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : "Put this device in",
							fields: [ 
								iomy.widgets.selectBoxRoom({
                                    selectedKey : "{/"+oView.byId("DevTypeSelect").getSelectedKey()+"/Room}",
                                    enabled : "{/enabled/IfRoomsExist}",
                                    template : {
                                        path : "/Rooms",
                                        item : new sap.ui.core.Item({
                                            key : "{RoomId}",
                                            text : "{RoomName}"
                                        })
                                    }
                                })
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : iomy.widgets.RequiredLabel("Display Name"),
							fields: [ 
								new sap.m.Input({
                                    value : "{/"+oView.byId("DevTypeSelect").getSelectedKey()+"/DisplayName}",
                                    enabled : "{/enabled/Always}"
                                })
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : iomy.widgets.RequiredLabel("Key Code"),
							fields: [ 
								new sap.m.Input ({
                                    value : "{/"+oView.byId("DevTypeSelect").getSelectedKey()+"/KeyCode}",
                                    enabled : "{/enabled/Always}"
                                })
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : iomy.widgets.RequiredLabel("Station Code"),
							fields: [ 
								new sap.m.Input ({
                                    value : "{/"+oView.byId("DevTypeSelect").getSelectedKey()+"/StationCode}",
                                    enabled : "{/enabled/Always}"
                                })
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : "",
							fields: [ 
								new sap.m.Button (oView.createId("ButtonSubmit"), {
									type: sap.m.ButtonType.Accept,
									text: "Save",
                                    enabled : "{/enabled/Always}",
                                    press : function () {
                                        oController.CreateDevice();
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