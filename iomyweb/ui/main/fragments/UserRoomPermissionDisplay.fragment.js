sap.ui.jsfragment("fragments.UserRoomPermissionDisplay", {
	
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
					fields : [
						new sap.m.Title ({
							text:"Freshwater Office"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Office",
					fields: [
						new sap.m.Text ({
							text:"Read/Write"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Master Bedroom",
					fields: [
						new sap.m.Text ({
							text:"Device Management, Read/Write"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Lounge Room",
					fields: [
						new sap.m.Text ({
							text:"Device Management, Read/Write"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					fields: [
						new sap.m.Title ({
							text:"Lee's House"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Office",
					fields: [
						new sap.m.Text ({
							text:" Read/Write"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Master Bedroom",
					fields: [
						new sap.m.Text ({
							text:"Device Management, Read/Write"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Lounge Room",
					fields: [
						new sap.m.Text ({
							text:"Device Management, Read/Write"
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