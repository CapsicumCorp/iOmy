sap.ui.jsfragment("fragments.ZigbeeSmartPlug", {
	
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
								IomyRe.widgets.selectBoxHub("HubSelect")
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : "Modem",
							fields: [ 
								new sap.m.Select (oView.createId("ZigModemSelect"),{
									items : [
										new sap.ui.core.Item ({
											text: "Please choose a Modem",
											key: "start"
										}),
										new sap.ui.core.Item ({
											text: "RapidHA",
											key: "RHA"
										}),
									]	
								})
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : "Custom Command",
							fields: [ 
								new sap.m.HBox ({
									items: [
										new sap.m.Input (oView.createId("CustomTelnetInput"),{
											layoutData : new sap.m.FlexItemData({
												growFactor : 1
											}),
										}),
										new sap.m.Button ({
											text:"+",
										})
									]
								})
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : "",
							fields: [ 
								new sap.m.Button ({
									layoutData : new sap.m.FlexItemData({
										growFactor : 1
									}),
									text:"Join Devices",
								})
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : "",
							fields: [ 
								new sap.m.TextArea ({
									enabled: false,
									layoutData : new sap.m.FlexItemData({
										growFactor : 1
									}),
									rows: 20
								})
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