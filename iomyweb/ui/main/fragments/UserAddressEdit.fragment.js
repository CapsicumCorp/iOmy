sap.ui.jsfragment("fragments.UserAddressEdit", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oFragContent = null;
        var oView        = oController.getView();
		
		var oItemTemplateTimezones = new sap.ui.core.Item({
			key:  "{TimezoneId}",
			text: "{TimezoneName}"
		});
		
		var oItemTemplateRegions = new sap.ui.core.Item({
			key:  "{RegionId}",
			text: "{RegionName}"
		});
		
		var oItemTemplateLanguages = new sap.ui.core.Item({
			key:  "{LanguageId}",
			text: "{LanguageName}"
		});
		
		//--------------------------------------------//
		//-- 5.0 - CREATE UI                        --//
		//--------------------------------------------//
		oFragContent = new sap.ui.layout.form.FormContainer({
			formElements : [
				new sap.ui.layout.form.FormElement({
					label : "Language",
					fields: [
						new sap.m.Select (oView.createId("SelectLanguage"), {
							selectedKey: "{/UserInfo/LanguageId}",
							items: {
								path: "/Languages",
								template: oItemTemplateLanguages
							},
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Street Address:",
					fields: [
						new sap.m.Input (oView.createId("InputAddressLine1"), {
							value:"{/UserInfo/AddressLine1}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Unit Number (if applicable):",
					fields: [
						new sap.m.Input (oView.createId("InputAddressLine2"), {
							value:"{/UserInfo/AddressLine2}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "City / Suburb",
					fields: [
						new sap.m.Input (oView.createId("InputAddressLine3"), {
							value:"{/UserInfo/AddressLine3}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "State / Province",
					fields: [
						new sap.m.Input (oView.createId("InputSubregion"), {
							value: "{/UserInfo/SubRegion}"
						}),
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Post Code / Zip Code",
					fields: [
						new sap.m.Input (oView.createId("InputPostCode"), {
							value: "{/UserInfo/Postcode}"
						}),
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Country / Region",
					fields: [
						new sap.m.Select (oView.createId("SelectRegion"), {
							selectedKey: "{/UserInfo/RegionId}",
							items: {
								path: "/Regions",
								template: oItemTemplateRegions
							},
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Timezone",
					fields: [
						new sap.m.Select (oView.createId("SelectTimezone"), {
							selectedKey: "{/UserInfo/TimezoneId}",
							items: {
								path: "/Timezones",
								template: oItemTemplateTimezones
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