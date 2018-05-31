sap.ui.jsfragment("fragments.UserRoomPermissionEdit", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oFragContent    = null;
        var oView           = oController.getView();
        
        var oItemTemplatePremises = new sap.ui.core.Item({
			key:  "{Id}",
			text: "{Name}"
		});
        
        var oItemTemplateRooms = new sap.ui.core.Item({
            key : "{RoomId}",
            text : "{RoomName}"
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
						new sap.m.Select (oView.createId("SelectPremise"), {
                            enabled: "{/enabled/Always}",
                            selectedKey : "{/RoomPermInfo/PremiseId}",
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
						new sap.m.Select(oView.createId("SelectRoom"), {
                            enabled: "{/enabled/Always}",
                            selectedKey : "{/RoomPermInfo/RoomId}",
                            items : {
                                path : "/RoomOptions",
                                template : oItemTemplateRooms
                            },
                            
                            change : function () {
                                oController.FetchUserRoomPermissions();
                            }
                        })
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Permission Level",
					fields: [
                        new sap.m.Select (oView.createId("SelectCurrentLevel"), {
                            enabled: "{/enabled/Always}",
                            selectedKey : "{/RoomPermInfo/CurrentLevel}",
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