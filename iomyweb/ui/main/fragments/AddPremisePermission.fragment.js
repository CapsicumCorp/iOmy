sap.ui.jsfragment("fragments.AddPremisePermission", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oFragContent = null;
		
		var oItemTemplatePremises = new sap.ui.core.Item({
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
							selectedKey: "{/NewUser/PremiseId}",
							items: {
								path: "/Premise",
								template: oItemTemplatePremises
							},
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Permission Level",
					fields: [
						new sap.m.Select ({
							selectedKey: "{/NewUser/PremPermId}",
							items : [
								new sap.ui.core.Item ({
									key: "1",
									text:"No Access"
								}),
								new sap.ui.core.Item ({
									key: "2",
									text:"Read"
								}),
								new sap.ui.core.Item ({
									key: "3",
									text:"Read/Write"
								}),
								new sap.ui.core.Item ({
									key: "4",
									text:"Premise Management, Read/Write"
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