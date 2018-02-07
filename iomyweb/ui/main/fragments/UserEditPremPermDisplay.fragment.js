sap.ui.jsfragment("fragments.UserEditPremPermDisplay", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oFragContent = null;
		
		var oItemTemplatePremise = new sap.ui.layout.form.FormElement({
			label : "{Name}",
			fields: [
				new sap.m.Text ({
					text: { 
						path:'Id', 
						formatter: function( iPremiseId ){ 
							try {
								//-- Lookup the Premise Code --//
								var sPremCode = "_"+iPremiseId;
								var iPremPermLevel = -1;
								
								//-- Find the selected Premise --//
								if( typeof oController.mModelData.PremisePerms[sPremCode]!=="undefined" ) {
									iPremPermLevel = oController.mModelData.PremisePerms[sPremCode].PermLevel;
									
								} else {
									iPremPermLevel = 0;
								}
								
								return iomy.common.LookupPremPermLevelName( iPremPermLevel );
								
							} catch(e1) {
								$.sap.log.error("FormatPremisePermNameFromPremiseId: Critcal Error:"+e1.message);
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
				path: "/AllPremises",
				template: oItemTemplatePremise
			}
		});
				
				
		//--------------------------------------------//
		//-- 9.0 - RETURN FORM                      --//
		//--------------------------------------------//
		return oFragContent;
	}
	
});