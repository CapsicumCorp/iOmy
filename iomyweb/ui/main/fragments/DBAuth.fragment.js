sap.ui.jsfragment("fragments.DBAuth", {
	
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
					label : iomy.widgets.RequiredLabel("Username"),
					fields: [
						new sap.m.Input ({
							value:"{/NewUser/DBUser}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : iomy.widgets.RequiredLabel("Password"),
					fields: [
						new sap.m.Input ({
							value:"{/NewUser/DBPassword}",
                            type:"Password"
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