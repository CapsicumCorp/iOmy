sap.ui.jsfragment("fragments.rules.AddRuleNew", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
        var oView           = oController.getView();
		var oFragContent    = null;
		
		//--------------------------------------------//
		//-- 5.0 - CREATE UI                        --//
		//--------------------------------------------//
		oFragContent = new sap.ui.layout.form.FormContainer({
			formElements : [
				new sap.ui.layout.form.FormElement({
					//"Rule Type" Defined in Database 
					label : "Rule Type",
					fields: [
                        new sap.m.Select({
							selectedKey : "1",
                            items : [
								new sap.ui.core.Item ({
									key: "1",
									text: "Turn On (Once only)"
								}),
								new sap.ui.core.Item ({
									key: "2",
									text: "Turn Off (Once only)"
								}),
								new sap.ui.core.Item ({
									key: "3",
									text: "Turn On (Reoccurring)"
								}),
								new sap.ui.core.Item ({
									key: "4",
									text: "Turn Off (Reoccurring)"
								}),
                            ]
                        })
					]
				}),
				new sap.ui.layout.form.FormElement({
					//"Rule Type" Defined in Database 
					label : "Supported Thing Type",
					fields: [
                        new sap.m.Select({
							selectedKey : "1",
                            items : [
								new sap.ui.core.Item ({
									key: "1",
									text: "Devices"
								}),
								new sap.ui.core.Item ({
									key: "2",
									text: "Links"
								}),
                            ]
                        })
					]
				}),
				new sap.ui.layout.form.FormElement({
					//label : "Display Name",
					label : "Device",
					fields: [
                        new sap.m.Select({
                            selectedKey : "1",
                            items : [
								new sap.ui.core.Item ({
									key: "1",
									text: "Fridge"
								}),
								new sap.ui.core.Item ({
									key: "2",
									text: "Freezer"
								}),
                            ]
                        })
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Time",
					fields: [
						new sap.m.TimePicker ({
							valueFormat: "hh:mm",
							displayFormat: "hh:mm a",
							placeholder: "Select an On Time",
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					//"Rule Type" Defined in Database 
					label : "Enabled",
					fields: [
                        sap.m.CheckBox
					]
				}),
				new sap.ui.layout.form.FormElement({
					label: "",
					fields: [
						new sap.m.Button (oView.createId("ButtonSubmit"), {
							text: "Update",
							type: sap.m.ButtonType.Accept,
							press:   function( oEvent ) {
								oController.saveRule();
							}
						}),
						new sap.m.Button (oView.createId("ButtonCancel"), {
							text: "Cancel",
							type: sap.m.ButtonType.Reject,
							press:   function( oEvent ) {
								IomyRe.common.NavigationChangePage( "pRulesList" ,  {} , false);
							}
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