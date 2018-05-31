sap.ui.jsfragment("fragments.UserPremisePermissionEdit", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oFragContent = null;
        
        var oItemTemplatePremises = new sap.ui.core.Item({
			key:  "{Id}",
			text: "{Name}"
		});
        
        var oItemTemplatePermissionLevels = new sap.ui.core.Item({
			key:  "{Key}",
			text: "{Text}"
		});
		
		//--------------------------------------------//
		//-- 5.0 - CREATE UI                        --//
		//--------------------------------------------//
		oFragContent = new sap.ui.layout.form.FormContainer({
			formElements : [
				new sap.ui.layout.form.FormElement({
					label : "Premise",
					fields: [
						new sap.m.Select ({
                            enabled: "{/enabled/Always}",
                            selectedKey : "{/PremisePermInfo/PremiseId}",
							items: {
								path: "/Premises",
								template: oItemTemplatePremises
							}
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Permission Level",
					fields: [
						new sap.m.Select ({
							enabled: "{/enabled/Always}",
                            selectedKey : "{/PremisePermInfo/CurrentLevel}",
							items: {
								path: "/PermLevels",
								template: oItemTemplatePermissionLevels
							}
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