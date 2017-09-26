sap.ui.jsfragment("fragments.premise.InfoEdit", {
	
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
					label : "Name",
					fields: [
						new sap.m.Input({})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Description",
					fields: [
						new sap.m.Input ({})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Bedrooms",
					fields: [
						new sap.m.Select ({
							items: [
								new sap.ui.core.Item ({
									text:"1"
								}),
								new sap.ui.core.Item ({
									text:"2"
								}),
								new sap.ui.core.Item ({
									text:"3"
								}),
								new sap.ui.core.Item ({
									text:"4"
								}),
								new sap.ui.core.Item ({
									text:"5+"
								})
							]
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Floors",
					fields: [
						new sap.m.Select ({
							items: [
								new sap.ui.core.Item ({
									text:"1"
								}),
								new sap.ui.core.Item ({
									text:"2"
								}),
								new sap.ui.core.Item ({
									text:"3"
								}),
								new sap.ui.core.Item ({
									text:"4"
								}),
								new sap.ui.core.Item ({
									text:"5+"
								})
							]
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Occupants",
					fields: [
						new sap.m.Select ({
							items: [
								new sap.ui.core.Item ({
									text:"1"
								}),
								new sap.ui.core.Item ({
									text:"2"
								}),
								new sap.ui.core.Item ({
									text:"3"
								}),
								new sap.ui.core.Item ({
									text:"4"
								}),
								new sap.ui.core.Item ({
									text:"5+"
								})
							]
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Rooms",
					fields: [
						new sap.m.Select ({
							items: [
								new sap.ui.core.Item ({
									text:"1"
								}),
								new sap.ui.core.Item ({
									text:"2"
								}),
								new sap.ui.core.Item ({
									text:"3"
								}),
								new sap.ui.core.Item ({
									text:"4"
								}),
								new sap.ui.core.Item ({
									text:"5"
								}),
								new sap.ui.core.Item ({
									text:"6"
								}),
								new sap.ui.core.Item ({
									text:"7"
								}),
								new sap.ui.core.Item ({
									text:"8"
								}),
								new sap.ui.core.Item ({
									text:"9"
								}),
								new sap.ui.core.Item ({
									text:"10+"
								}),
							]
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