sap.ui.jsfragment("fragments.UserPremisePermissionDisplay", {
	
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
					label : "Freshwater Office",
					fields: [
						new sap.m.Text ({
							text:"Read/Write"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Lee's House",
					fields: [
						new sap.m.Text ({
							text:"Premise Management, Read/Write"
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