sap.ui.jsfragment("fragments.rules.AddRule", {
	
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
					label : "Display Name",
					fields: [ 
						new sap.m.Input ({
							value:""
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "On Time",
					fields: [
						new sap.m.TimePicker ({
							valueFormat: "hh:mm",
							displayFormat: "hh:mm a",
							placeholder: "Select an On Time",
						}),
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Off Time",
					fields: [
						new sap.m.TimePicker ({
							valueFormat: "hh:mm",
							displayFormat: "hh:mm a",
							placeholder: "Select an Off Time",
						}),
					]
				}),
				new sap.ui.layout.form.FormElement({
					label: "",
					fields: [
						new sap.m.Button ({
							text: "Save",
							type: sap.m.ButtonType.Accept,
							//press:   function( oEvent ) {
							//	oController.UpdateRoomInfoValues( oController );
							//}
						}),
						new sap.m.Button ({
							text: "Cancel",
							type: sap.m.ButtonType.Reject,
							//press:   function( oEvent ) {
							//	IomyRe.common.NavigationChangePage( "pRoomList" ,  {"bEditing": true} , false);
							//}
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