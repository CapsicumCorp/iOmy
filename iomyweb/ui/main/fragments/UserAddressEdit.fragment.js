sap.ui.jsfragment("fragments.UserAddressEdit", {
	
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
					label : "Language",
					fields: [
						new sap.m.Select ({
							items : [
								new sap.ui.core.Item ({
									text:"English"
								}),
								new sap.ui.core.Item ({
									text:"etc"
								}),
							]
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Street Address:",
					fields: [
						new sap.m.Input ({
							text:"12 Water Street"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Unit Number (if applicable):",
					fields: [
						new sap.m.Input ({
							text:"Unit 15"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "City / Suburb",
					fields: [
						new sap.m.Input ({
							text:""
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "State / Province",
					fields: [
						new sap.m.Input ({
							text: "Queensland"
						}),
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Post Code / Zip Code",
					fields: [
						new sap.m.Input ({
							text: "4655"
						}),
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Country / Region",
					fields: [
						new sap.m.Select ({
							items : [
								new sap.ui.core.Item ({
									text:"Australia"
								}),
								new sap.ui.core.Item ({
									text:"etc"
								}),
							]
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Timezone",
					fields: [
						new sap.m.Select ({
							items : [
								new sap.ui.core.Item ({
									text:"Australia/Brisbane"
								}),
								new sap.ui.core.Item ({
									text:"etc"
								}),
							]
						})
					]
				}),
			]
		});
							
		//--------------------------------------------//
		//-- 9.0 - RETURN FORM                      --//
		//--------------------------------------------//
		return oFragContent;
	}
	
});