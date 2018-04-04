sap.ui.jsfragment("fragments.room.EditRoom", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oFragContent    = null;
        var oView           = oController.getView();
		
		var oItemTemplateRoomTypes = new sap.ui.core.Item({
			key:  "{RoomTypeId}",
			text: "{RoomTypeName}"
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
						new sap.m.Text ({
							text:"{/fields/PremiseName}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label: "",
					fields: [
						new sap.m.Button (oView.createId("ButtonSubmit"), {
							text: "Update",
                            enabled: "{/controlsEnabled/WhenReady}",
							type: sap.m.ButtonType.Accept,
							press:   function( oEvent ) {
								oController.UpdateRoomInfoValues( oController );
							}
						}),
						new sap.m.Button (oView.createId("ButtonCancel"), {
							text: "Cancel",
                            enabled: "{/controlsEnabled/WhenReady}",
							type: sap.m.ButtonType.Reject,
							press:   function( oEvent ) {
								iomy.common.NavigationChangePage( "pRoomList" ,  {"bEditing": true} , false);
							}
						}),
						new sap.m.Button (oView.createId("ButtonDelete"), {
							text: "Delete",
                            enabled: "{/controlsEnabled/WhenReady}",
							type: sap.m.ButtonType.Reject,
							press:   function( oEvent ) {
								oController.DeleteRoomInfoValues();
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