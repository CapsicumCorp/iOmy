sap.ui.jsfragment("fragments.UserRoomPermissionDisplay", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oFragContent = null;
		
		var oItemTemplateRooms = new sap.ui.layout.form.FormElement({
			label : "{RoomName}",
			fields: [
				new sap.m.Text ({
					//text:"Read/Write"
					text: "{ path:'RoomId', formatter:'iomy.common.LookupRoomPermissionFromId'}"
				})
			]
		});
		
		//--------------------------------------------//
		//-- 5.0 - CREATE UI                        --//
		//--------------------------------------------//
		oFragContent = new sap.ui.layout.form.FormContainer({
			formElements : {
				path: "/Rooms",
				template: oItemTemplateRooms
			}
		});	
				
				
		//--------------------------------------------//
		//-- 9.0 - RETURN FORM                      --//
		//--------------------------------------------//
		return oFragContent;
	}
	
});