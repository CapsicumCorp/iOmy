sap.ui.jsfragment("fragments.AddUserInfo", {
	
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
					label : "Gender",
					fields: [
						new sap.m.Select ({
							selectedKey: "{/NewUser/Gender}",
							items : [
								new sap.ui.core.Item ({
									key: "1",
									text: "Female"
								}),
								new sap.ui.core.Item ({
									key: "2",
									text: "Male"
								}),
								new sap.ui.core.Item ({
									key: "3",
									text: "Other/Unassigned"
								}),
							]
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Title",
					fields: [
						new sap.m.Input ({
							value:"{/NewUser/Title}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Given Names",
					fields: [
						new sap.m.Input ({
							value:"{/NewUser/Givenname}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Surname",
					fields: [
						new sap.m.Input ({
							value:"{/NewUser/Surname}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Display Name",
					fields: [
						new sap.m.Input ({
							value:"{/NewUser/Displayname}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Date of Birth",
					fields: [
						new sap.m.DatePicker ({
							dateValue:"{/NewUser/DOB}",
							valueFormat: "yyyy-MM-dd",
							displayFormat: "yyyy-MM-dd"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Alert Email",
					fields: [
						new sap.m.Input ({
							value:"{/NewUser/Email}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Alert Mobile",
					fields: [
						new sap.m.Input ({
							value: "{/NewUser/Phone}"
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