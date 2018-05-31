sap.ui.jsfragment("fragments.UserEditInfoEdit", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oFragContent = null;
	
		//--------------------------------------------//
		//-- 5.0 - CREATE UI                        --//
		//--------------------------------------------//
		oFragContent = new sap.ui.layout.form.FormContainer({
			formElements : [
				new sap.ui.layout.form.FormElement({
					label : "Given Names",
					fields: [
						new sap.m.Input ({
							enabled : "{/enabled/Always}",
							value:"{/UserInfo/Givennames}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Surname",
					fields: [
						new sap.m.Input ({
							enabled : "{/enabled/Always}",
							value:"{/UserInfo/Surnames}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Display Name",
					fields: [
						new sap.m.Input ({
							enabled : "{/enabled/Always}",
							value:"{/UserInfo/Displayname}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Alert Email",
					fields: [
						new sap.m.Input ({
							enabled : "{/enabled/Always}",
							value:"{/UserInfo/Email}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Alert Mobile",
					fields: [
						new sap.m.Input ({
							enabled : "{/enabled/Always}",
							value: "{/UserInfo/Phone}"
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