sap.ui.jsfragment("fragments.UserEditRoomPermEdit", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oFragContent = null;
		
		var oItemTemplate = new sap.ui.core.Item({
			key:  "{Id}",
			text: "{Name}"
		});
		
		
		//--------------------------------------------//
		//-- 5.0 - CREATE UI                        --//
		//--------------------------------------------//
		oFragContent = new sap.ui.layout.form.FormContainer({
			formElements: [
				new sap.ui.layout.form.FormElement({
					label:  "Premise",
					fields: [
						new sap.m.Select ({
							selectedKey: "{/Form/RoomPerm/PremiseId}",
							items: {
								path:     "/AllPremises",
								template: oItemTemplate
							},
							change: function( oEvent ) {
								try {
									oController.UpdatePremiseRoomList( oController );
									oController.UpdateSelectableRoomPerms( oController );
									oController.RefreshModel( oController, {} );
								} catch( e1 ) {
									$.sap.log.error("Premise room list issue");
								}
							}
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label:  "Room",
					fields: [
						IomyRe.widgets.selectBoxRoom({
							selectedKey: "{/Form/RoomPerm/Id}",
							template: {
								path: "/RoomSelectOptions",
								item: new sap.ui.core.Item({
									key:    "{Id}",
									text:   "{Name}"
								})
							},
							change: function( oEvent ) {
								try {
									oController.UpdateSelectableRoomPerms( oController );
									oController.RefreshModel( oController, {} );
								} catch( e1 ) {
									$.sap.log.error("Room permissions issue");
								}
							}
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label:  "Permission Level",
					fields: [
						new sap.m.Select({
							selectedKey: "{/Form/RoomPerm/PermLevel}",
							items: {
								path: "/PermLevelsRoom",
								template: oItemTemplate
							}
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