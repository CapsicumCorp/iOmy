sap.ui.jsfragment("fragments.room.EditRoom", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oFragContent = null;
		
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
					label : "Room Name",
					fields: [ 
						new sap.m.Input ({
							value:"{/CurrentRoom/RoomName}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Description",
					fields: [
						new sap.m.Input ({
							value:"{/CurrentRoom/RoomDesc}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Room Type",
					fields: [
						new sap.m.Select ({
							selectedKey: "{/CurrentRoom/RoomTypeId}",
							items: {
								path: "/RoomTypes",
								template: oItemTemplateRoomTypes
							},
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Assigned Premise",
					fields: [
						new sap.m.Text ({
							text:"{/CurrentRoom/PremiseName}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label: "",
					fields: [
						new sap.m.Button ({
							text: "Update",
							type: sap.m.ButtonType.Accept,
							press:   function( oEvent ) {
								oController.UpdateRoomInfoValues( oController );
							}
						}),
						new sap.m.Button ({
							text: "Cancel",
							type: sap.m.ButtonType.Reject,
							press:   function( oEvent ) {
								IomyRe.common.NavigationChangePage( "pRoomList" ,  {"bEditing": true} , false);
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