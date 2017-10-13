sap.ui.jsfragment("fragments.UserPremisePermissionDisplay", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oFragContent = null;
		
		var oItemTemplatePremise = new sap.ui.layout.form.FormElement({
			label : "{Name}",
			fields: [
				new sap.m.Text ({
					//text:"Read/Write"
					text: "{ path:'Id', formatter:'IomyRe.common.LookupPremisePermissionFromId'}"
				})
			]
		});
		
		//--------------------------------------------//
		//-- 5.0 - CREATE UI                        --//
		//--------------------------------------------//
		oFragContent = new sap.ui.layout.form.FormContainer({
			formElements : {
				path: "/Premise",
				template: oItemTemplatePremise
			}
		});	
				
				
		//--------------------------------------------//
		//-- 9.0 - RETURN FORM                      --//
		//--------------------------------------------//
		return oFragContent;
	}
	
});