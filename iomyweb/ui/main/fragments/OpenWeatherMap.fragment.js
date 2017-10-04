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
								IomyRe.widgets.selectBoxHub(oView.createId("HubSelect"), {
                                    selectedKey : "{/"+oView.byId("DevTypeSelect").getSelectedKey()+"/Hub}"
                                })
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : "Put this device in",
							fields: [ 
								IomyRe.widgets.selectBoxRoom({
                                    id : "RoomSelection",
                                    selectedKey : "{/"+oView.byId("DevTypeSelect").getSelectedKey()+"/Room}"
                                })
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : "Display Name",
							fields: [ 
								new sap.m.Input({
                                    value : "{/"+oView.byId("DevTypeSelect").getSelectedKey()+"/DisplayName}"
                                })
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : "Key Code",
							fields: [ 
								new sap.m.Input ({
                                    value : "{/"+oView.byId("DevTypeSelect").getSelectedKey()+"/KeyCode}"
                                })
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : "Station Code",
							fields: [ 
								new sap.m.Input ({
                                    value : "{/"+oView.byId("DevTypeSelect").getSelectedKey()+"/StationCode}"
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
									text: "Cancel"
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