sap.ui.jsfragment("fragments.rules.AddRule", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
        var oView           = oController.getView();
		var oFragContent    = null;
        
        var oDeviceTemplate = new sap.ui.core.Item({
            key : "{path: 'Id', formatter: 'IomyRe.devices.getSerialCodeOfDevice'}",
            text : "{DisplayName}"
        });
		
		//--------------------------------------------//
		//-- 5.0 - CREATE UI                        --//
		//--------------------------------------------//
		oFragContent = new sap.ui.layout.form.FormContainer({
			formElements : [
				new sap.ui.layout.form.FormElement({
					//label : "Display Name",
					label : "Device",
					fields: [
                        new sap.m.Select({
                            selectedKey : "{/Rule/Serial}",
                            items : {
                                "path" : "/Devices",
                                "template" : oDeviceTemplate
                            }
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