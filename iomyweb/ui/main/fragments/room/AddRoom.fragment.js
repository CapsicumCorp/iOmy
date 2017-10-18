sap.ui.jsfragment("fragments.room.AddRoom", {
	
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
						new sap.m.Input ({})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Description",
					fields: [
						new sap.m.Input ({})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Room Type",
					fields: [
						new sap.m.Select ({})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label: "",
					fields: [
						new sap.m.Button ({
							text: "Save",
							type: sap.m.ButtonType.Accept
						}),
						new sap.m.Button ({
							text: "Cancel",
							type: sap.m.ButtonType.Reject
						}),
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