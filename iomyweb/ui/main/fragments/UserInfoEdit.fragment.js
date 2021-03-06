sap.ui.jsfragment("fragments.UserInfoEdit", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oFragContent = null;
        var oView        = oController.getView();
	
		//--------------------------------------------//
		//-- 5.0 - CREATE UI                        --//
		//--------------------------------------------//
		oFragContent = new sap.ui.layout.form.FormContainer({
			formElements : [
				new sap.ui.layout.form.FormElement({
					label : "Given Names",
					fields: [
						new sap.m.Input (oView.createId("InputGivenNames"), {
							enabled: "{/enabled/Always}",
                            value:"{/UserInfo/Givenname}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Surname",
					fields: [
						new sap.m.Input (oView.createId("InputSurname"), {
							enabled: "{/enabled/Always}",
                            value:"{/UserInfo/Surname}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Display Name",
					fields: [
						new sap.m.Input (oView.createId("InputDisplayName"), {
							enabled: "{/enabled/Always}",
                            value:"{/UserInfo/Displayname}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Alert Email",
					fields: [
						new sap.m.Input (oView.createId("InputEmail"), {
							enabled: "{/enabled/Always}",
                            value:"{/UserInfo/Email}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Alert Mobile",
					fields: [
						new sap.m.Input (oView.createId("InputMobile"), {
							enabled: "{/enabled/Always}",
                            value: "{/UserInfo/Phone}"
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