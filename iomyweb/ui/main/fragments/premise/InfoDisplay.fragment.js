sap.ui.jsfragment("fragments.premise.InfoDisplay", {
	
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
						new sap.m.Text ({
							text: "Freshwater Home"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Description",
					fields: [
						new sap.m.Text ({
							text: "No Place Like It!"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Bedrooms",
					fields: [
						new sap.m.Text ({
							text: "5+"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Floors",
					fields: [
						new sap.m.Text ({
							text: "2"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Occupants",
					fields: [
						new sap.m.Text ({
							text: "5+"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Rooms",
					fields: [
						new sap.m.Text ({
							text: "10+"
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