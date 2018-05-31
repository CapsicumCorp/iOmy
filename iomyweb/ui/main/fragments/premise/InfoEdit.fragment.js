sap.ui.jsfragment("fragments.premise.InfoEdit", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oFragContent = null;
        var oView        = oController.getView();
		
		//--------------------------------------------//
		//-- 5.0 - CREATE UI                        --//
		//--------------------------------------------//
		oFragContent = new sap.ui.layout.form.FormContainer({
			formElements : [
				new sap.ui.layout.form.FormElement({
					label : iomy.widgets.RequiredLabel("Name"),
					fields: [
						new sap.m.Input(oView.createId("InputName"), {
                            enabled : "{/enabled/Always}",
                            value : "{/Information/Name}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Description",
					fields: [
						new sap.m.Input (oView.createId("InputDesc"), {
                            enabled : "{/enabled/Always}",
                            value : "{/Information/Desc}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Bedrooms",
					fields: [
						new sap.m.Select (oView.createId("SelectBedroomCountId"), {
							enabled : "{/enabled/Always}",
                            selectedKey : "{/Information/BedroomCountId}",
							items : {
                                path : "/Options/BedroomCount",
                                template : new sap.ui.core.Item({
                                    key : "{BedroomCountId}",
                                    text : "{BedroomCount}"
                                })
                            }
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Floors",
					fields: [
						new sap.m.Select (oView.createId("SelectFloorCountId"), {
							enabled : "{/enabled/Always}",
                            selectedKey : "{/Information/FloorCountId}",
							items : {
                                path : "/Options/FloorCount",
                                template : new sap.ui.core.Item({
                                    key : "{FloorCountId}",
                                    text : "{FloorCount}"
                                })
                            }
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Occupants",
					fields: [
						new sap.m.Select (oView.createId("SelectOccupantCountId"), {
							enabled : "{/enabled/Always}",
                            selectedKey : "{/Information/OccupantCountId}",
							items : {
                                path : "/Options/OccupantCount",
                                template : new sap.ui.core.Item({
                                    key : "{OccupantCountId}",
                                    text : "{OccupantCount}"
                                })
                            }
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Rooms",
					fields: [
						new sap.m.Select (oView.createId("SelectRoomCountId"), {
							enabled : "{/enabled/Always}",
                            selectedKey : "{/Information/RoomCountId}",
							items : {
                                path : "/Options/RoomCount",
                                template : new sap.ui.core.Item({
                                    key : "{RoomCountId}",
                                    text : "{RoomCount}"
                                })
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