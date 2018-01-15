sap.ui.jsfragment("fragments.AddRoomPermission", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oFragContent = null;
        var oView        = oController.getView();
		
		var oItemTemplatePremises = new sap.ui.core.Item({
			key:  "{Id}",
			text: "{Name}"
		});
		
		var oItemTemplateRooms = new sap.ui.core.Item({
			key:  "{RoomId}",
			text: "{RoomName}"
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
					label : "Room",
					fields: [
						new sap.m.Select ({
								selectedKey: "{/NewUser/RoomId}",
							items: {
								path: "/Rooms",
								template: oItemTemplateRooms
							},
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Permission Level",
					fields: [
						new sap.m.Select ({
							selectedKey: "{/NewUser/RoomPermId}",
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
									text:"Read/DeviceToggle"
								}),
								new sap.ui.core.Item ({
									key: "4",
									text:"Read/Write"
								}),
							]
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label: "",
					fields: [
						new sap.m.Button (oView.createId("SubmitButton"), {
							text: "Save",
							type: sap.m.ButtonType.Accept,
							press:   function( oEvent ) {
								oController.InsertNewUserInfo( oController );
							}
						}),
						new sap.m.Button (oView.createId("CancelButton"), {
							text: "Cancel",
							type: sap.m.ButtonType.Reject,
							press:   function( oEvent ) {
								IomyRe.common.NavigationChangePage( "pBlock" ,  {} , false);
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