sap.ui.jsfragment("fragments.room.AddRoom", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oFragContent = null;
        var oView        = oController.getView();
		
		var oItemTemplateRoomTypes = new sap.ui.core.Item({
			key:  "{RoomTypeId}",
			text: "{RoomTypeName}"
		});
		
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
					label : iomy.widgets.RequiredLabel("Room Name"),
					fields: [ 
						new sap.m.Input ({
							value:"{/fields/RoomName}",
                            enabled: "{/controlsEnabled/WhenReady}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Description",
					fields: [
						new sap.m.Input ({
							value:"{/fields/RoomDesc}",
                            enabled: "{/controlsEnabled/WhenReady}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Room Type",
					fields: [
						new sap.m.Select ({
							selectedKey: "{/fields/RoomTypeId}",
                            enabled: "{/controlsEnabled/WhenReady}",
							items: {
								path: "/options/RoomTypes",
								template: oItemTemplateRoomTypes
							},
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Assigned Premise",
					fields: [
						new sap.m.Select ({
							selectedKey: "{/fields/PremiseId}",
                            enabled: "{/controlsEnabled/WhenReady}",
							items: {
								path: "/options/Premises",
								template: oItemTemplatePremises
							},
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label: "",
					fields: [
						new sap.m.Button (oView.createId("ButtonSubmit"), {
							text: "Save",
                            enabled: "{/controlsEnabled/WhenReady}",
							type: sap.m.ButtonType.Accept,
							press:   function( oEvent ) {
								oController.InsertRoomInfoValues( oController );
							}
						}),
						new sap.m.Button (oView.createId("ButtonCancel"), {
							text: "Cancel",
                            enabled: "{/controlsEnabled/WhenReady}",
							type: sap.m.ButtonType.Reject,
							press:   function( oEvent ) {
								iomy.common.NavigationChangePage( "pRoomList" ,  {} , false);
							}
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