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
								new sap.m.Select (oView.createId("HubSelect"),{
									items : [
										new sap.ui.core.Item ({
											text: "Please choose a Hub",
											key: "start"
										}),
										new sap.ui.core.Item ({
											text: "AndroidSTB",
											key: "AndSTB"
										}),
									]	
								})
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : "Put this device in",
							fields: [ 
								new sap.m.Select (oView.createId("RoomSelection"),{
									items : [
										new sap.ui.core.Item ({
											text: "Room1",
											key: "Room1"
										}),
										new sap.ui.core.Item ({
											text: "Room2",
											key: "Room2"
										}),
										new sap.ui.core.Item ({
											text: "Room3",
											key: "Room3"
										}),
									]	
								})
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : "Network Address",
							fields: [ 
								new sap.m.Input ({
									placeholder : "Enter IP Address"
								}),
								new sap.m.Input ({
									placeholder: "Enter Port Number"
								})
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : "Device Token Label",
							fields: [ 
								new sap.m.Input ({
									placeholder : "Located in your Phillips Hue bridge manual"
								})
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : "",
							fields: [ 
								new sap.m.Button ({
									type: sap.m.ButtonType.Accept,
									text: "Save"
								}),
								new sap.m.Button ({
									type: sap.m.ButtonType.Reject,
									text: "Cancel"
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