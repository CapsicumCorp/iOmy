sap.ui.jsfragment("fragments.UserEditRoomPermDisplay", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oFragContent = null;
		
		var oItemTemplateRooms = new sap.ui.layout.form.FormElement({
			label : "{Name}",
			fields: [
				new sap.m.Text ({
					//text: "In progress"
					//text: "{ path:'RoomId', formatter:'IomyRe.common.LookupRoomPermLevelName'}"
					text: {
						path: 'Id', 
						formatter: function( iRoomId ){ 
							try {
								//-- Lookup the Premise Code --//
								var sRoomCode = "_"+iRoomId;
								var iRoomPermLevel = -1;
								
								//-- Find the selected Premise --//
								if( typeof oController.mModelData.RoomPerms[sRoomCode]!=="undefined" ) {
									iRoomPermLevel = oController.mModelData.RoomPerms[sRoomCode].PermLevel;
									
								} else {
									iRoomPermLevel = 0;
								}
								
								return IomyRe.common.LookupRoomPermLevelName( iRoomPermLevel );
								
							} catch(e1) {
								$.sap.log.error("FormatRoomPermNameFromRoomId: Critcal Error:"+e1.message);
								return false;
							}
						}
					}
				})
			]
		});
		
		//--------------------------------------------//
		//-- 5.0 - CREATE UI                        --//
		//--------------------------------------------//
		oFragContent = new sap.ui.layout.form.FormContainer({
			formElements : {
				path: "/AllRooms",
				template: oItemTemplateRooms
			}
		});
		
		
		//--------------------------------------------//
		//-- 9.0 - RETURN FORM                      --//
		//--------------------------------------------//
		return oFragContent;
	}
	
});