sap.ui.jsfragment("fragments.UserRoomPermissionEdit", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oFragContent = null;
        
        var oItemTemplatePremises = new sap.ui.core.Item({
			key:  "{Id}",
			text: "{Name}"
		});
        
        var oItemTemplatePermissionLevels = new sap.ui.core.Item({
			key:  "{Key}",
			text: "{Text}"
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
							items: {
								path: "/Premises",
								template: oItemTemplatePremises
							}
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Room",
					fields: [
						IomyRe.widgets.selectBoxRoom({
                            selectedKey : "{/NewUser/RoomId}",
                            template : {
                                path : "/Rooms",
                                item : new sap.ui.core.Item({
                                    key : "{RoomId}",
                                    text : "{RoomName}"
                                })
                            }
                        })
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Permission Level",
					fields: [
                        new sap.m.Select ({
							items: {
								path: "/PermLevels",
								template: oItemTemplatePermissionLevels
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