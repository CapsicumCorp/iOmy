sap.ui.jsfragment("fragments.UserAddressDisplay", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oFragContent = null;
		
		
		//--------------------------------------------//
		//-- 5.0 - CREATE UI                        --//
		//--------------------------------------------//
		oFragContent = new sap.ui.layout.form.FormContainer({
			formElements : [
				new sap.ui.layout.form.FormElement({
					label : "Language",
					fields: [
						new sap.m.Text ({
							text: "{ path:'/UserInfo/LanguageId', formatter:'iomy.common.LookupLanguageNameFromLanguageId'}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Street Address",
					fields: [
						new sap.m.Text ({
							text:"{/UserInfo/AddressLine1}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Unit Number (if applicable)",
					fields: [
						new sap.m.Text ({
							text:"{/UserInfo/AddressLine2}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "City / Suburb",
					fields: [
						new sap.m.Text ({
							text:"{/UserInfo/AddressLine3}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "State / Province",
					fields: [
						new sap.m.Text ({
							text: "{/UserInfo/SubRegion}"
						}),
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Post Code / Zip Code",
					fields: [
						new sap.m.Text ({
							text: "{/UserInfo/Postcode}"
						}),
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Country / Region",
					fields: [
						new sap.m.Text({
							text: "{ path:'/UserInfo/RegionId', formatter:'iomy.common.LookupRegionNameFromRegionId'}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Timezone",
					fields: [
						new sap.m.Text ({
							text: "{ path:'/UserInfo/TimezoneId', formatter:'iomy.common.LookupTimezoneNameFromTimezoneId'}"
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