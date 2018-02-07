sap.ui.jsfragment("fragments.UserEditPremPermEdit", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oFragContent = null;
		
		var oItemTemplate = new sap.ui.core.Item({
			key:  "{Id}",
			text: "{Name}"
		});
		
		var oItemTemplatePremise = new sap.ui.core.Item({
			key:  "{Id}",
			text: "{Name}"
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
							selectedKey: "{/Form/PremisePerm/Id}",
							items: {
								path: "/PremiseSelectOptions",
								template: oItemTemplatePremise
							},
							change: function( oEvent ) {
								try {
									oController.UpdateSelectablePremisePerms( oController );
									oController.RefreshModel( oController, {} );
								} catch( e1 ) {
									$.sap.log.error("Premise permissions issue");
								}
							}
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Permission Level",
					fields: [
						new sap.m.Select ({
							selectedKey: "{/Form/PremisePerm/PermLevel}",
							enabled: "{ path:'/Form/PremisePerm/PermLevel', formatter:'iomy.common.LookupPremPermLevelEditable'}", 
							items: {
								path:     "/PermLevelsPremise",
								template: oItemTemplate
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