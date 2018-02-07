sap.ui.jsfragment("fragments.rules.EditRule", {
	
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
					label : "Display Name",
					fields: [ 
						new sap.m.Input ({
                            enabled: false,
							value: "{path:'/Rule/Serial', formatter: 'iomy.rules.getDeviceDisplayName'}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "On Time",
					fields: [
						new sap.m.TimePicker ({
							valueFormat: "hh:mm",
							displayFormat: "hh:mm a",
							placeholder: "Select an On Time",
                            dateValue: "{/Rule/Ontime}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Off Time",
					fields: [
						new sap.m.TimePicker ({
							valueFormat: "hh:mm",
							displayFormat: "hh:mm a",
							placeholder: "Select an Off Time",
                            dateValue: "{/Rule/Offtime}"
						})
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
								iomy.common.NavigationChangePage( "pRulesList" ,  {} , false);
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