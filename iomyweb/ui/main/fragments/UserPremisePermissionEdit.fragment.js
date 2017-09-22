sap.ui.jsfragment("fragments.UserPremisePermissionEdit", {
	
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
					label : "User",
					fields: [
						new sap.m.Select ({
							enabled: false,
							items : [
								new sap.ui.core.Item ({
									text:"Freshwater Office"
								}),
								new sap.ui.core.Item ({
									text:"etc"
								}),
							]
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Premise",
					fields: [
						new sap.m.Select ({
							items : [
								new sap.ui.core.Item ({
									text:"Freshwater Office"
								}),
								new sap.ui.core.Item ({
									text:"etc"
								}),
							]
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Permission Level",
					fields: [
						new sap.m.Select ({
							items : [
								new sap.ui.core.Item ({
									text:"No Access"
								}),
								new sap.ui.core.Item ({
									text:"Read"
								}),
								new sap.ui.core.Item ({
									text:"Read/Write"
								}),
								new sap.ui.core.Item ({
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