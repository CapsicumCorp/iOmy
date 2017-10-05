sap.ui.jsfragment("fragments.IPCamera", {
	
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
								new sap.m.Input ({
									placeholder : "Name of the Camera Stream",
                                    value : "{/"+oView.byId("DevTypeSelect").getSelectedKey()+"/DisplayName}"
								})
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : "Type",
							fields: [ 
								new sap.m.Select({
									items : [
										new sap.ui.core.Item ({
											text: "MJPEG IP Camera",
											key: "MJPEG"
										}),
										new sap.ui.core.Item ({
											text: "Example",
											key: "Ex"
										}),
									]
								}),
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : "Network Address",
							fields: [ 
								new sap.m.Input({
									placeholder: "Enter Protocol",
                                    value : "{/"+oView.byId("DevTypeSelect").getSelectedKey()+"/Protocol}"
								}),
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
							label : "Path",
							fields: [ 
								new sap.m.Input({
									placeholder: "e.g. video",
                                    value : "{/"+oView.byId("DevTypeSelect").getSelectedKey()+"/Path}"
								}),
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