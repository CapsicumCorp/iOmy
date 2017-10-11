sap.ui.jsfragment("fragments.PhillipsHueBridge", {
	
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
								IomyRe.widgets.selectBoxHub(oView.createId("HubSelect"), {
                                    selectedKey : "{/"+oView.byId("DevTypeSelect").getSelectedKey()+"/Hub}",
                                    template : {
                                        path : "/Hubs",
                                        item : new sap.ui.core.Item({
                                            key : "{HubId}",
                                            text : "{HubName}"
                                        })
                                    },
                                    
                                    change : function () {
                                        oController.SetPremiseId();
                                    }
                                })
							]
						}),
						new sap.ui.layout.form.FormElement(oView.createId("RoomFormElement"), {
							label : "Put this device in",
							fields: [ 
								IomyRe.widgets.selectBoxRoom({
                                    selectedKey : "{/"+oView.byId("DevTypeSelect").getSelectedKey()+"/Room}",
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
							label : "Display Name",
							fields: [ 
								new sap.m.Input ({
									placeholder : "Name of the Bridge",
                                    value : "{/"+oView.byId("DevTypeSelect").getSelectedKey()+"/DisplayName}"
								})
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : "Network Address",
							fields: [ 
								new sap.m.Input({
									placeholder: "Enter IP Address",
                                    value : "{/"+oView.byId("DevTypeSelect").getSelectedKey()+"/IPAddress}"
								}),
								new sap.m.Input({
									placeholder: "Enter Port Number",
                                    type : "Number",
                                    value : "{/"+oView.byId("DevTypeSelect").getSelectedKey()+"/IPPort}"
								}),
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : "Device Token Label",
							fields: [ 
								new sap.m.Input ({
									placeholder : "Located in your Phillips Hue bridge manual",
                                    value : "{/"+oView.byId("DevTypeSelect").getSelectedKey()+"/DeviceToken}"
								})
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : "",
							fields: [ 
								new sap.m.Button ({
									type: sap.m.ButtonType.Accept,
									text: "Save",
                                    press : function () {
                                        oController.CreateDevice();
                                    }
								}),
								new sap.m.Button ({
									type: sap.m.ButtonType.Reject,
									text: "Cancel",
                                    press : function () {
                                        oController.CancelInput();
                                    }
								}),
							]
						}),
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