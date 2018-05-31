sap.ui.jsfragment("fragments.UserEditAddressEdit", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oFragContent = null;
		
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
						new sap.m.Select ({
							enabled : "{/enabled/Always}",
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
						new sap.m.Input ({
                            enabled : "{/enabled/Always}",
							value:"{/UserInfo/Line1}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Unit Number (if applicable):",
					fields: [
						new sap.m.Input ({
							enabled : "{/enabled/Always}",
							value:"{/UserInfo/Line2}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "City / Suburb",
					fields: [
						new sap.m.Input ({
							enabled : "{/enabled/Always}",
							value:"{/UserInfo/Line3}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "State / Province",
					fields: [
						new sap.m.Input ({
							enabled : "{/enabled/Always}",
							value: "{/UserInfo/SubRegion}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Post Code / Zip Code",
					fields: [
						new sap.m.Input ({
							enabled : "{/enabled/Always}",
							value: "{/UserInfo/Postcode}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Country / Region",
					fields: [
						new sap.m.Select ({
							enabled : "{/enabled/Always}",
							selectedKey: "{/UserInfo/RegionId}",
							items: {
								path: "/Regions",
								template: oItemTemplateRegions
							}
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Timezone",
					fields: [
						new sap.m.Select ({
							enabled : "{/enabled/Always}",
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