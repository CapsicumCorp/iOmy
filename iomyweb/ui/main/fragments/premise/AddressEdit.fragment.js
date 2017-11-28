sap.ui.jsfragment("fragments.premise.AddressEdit", {
	
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
						new sap.m.Select ({
                            selectedKey : "{/Address/LanguageId}",
							items : {
                                path : "/Options/Languages",
                                template : new sap.ui.core.Item({
                                    key : "{LanguageId}",
                                    text : "{LanguageName}"
                                })
                            }
						})
					]
				}),new sap.ui.layout.form.FormElement({
					label : "Street Address",
					fields: [
						new sap.m.Input ({
                            value : "{/Address/AddressLine1}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Unit Number (if applicable)",
					fields: [
						new sap.m.Input ({
                            value : "{/Address/AddressLine2}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "City / Suburb",
					fields: [
						new sap.m.Input ({
                            value : "{/Address/AddressLine3}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "State / Province",
					fields: [
						new sap.m.Input ({
                            value : "{/Address/Subregion}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Post Code / Zip Code",
					fields: [
						new sap.m.Input ({
                            value : "{/Address/PostCode}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Country / Region",
					fields: [
						new sap.m.Select ({
							selectedKey : "{/Address/RegionId}",
							items : {
                                path : "/Options/Regions",
                                template : new sap.ui.core.Item({
                                    key : "{RegionId}",
                                    text : "{RegionName}"
                                })
                            }
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Timezone",
					fields: [
						new sap.m.Select ({
							selectedKey : "{/Address/TimezoneId}",
							items : {
                                path : "/Options/Timezones",
                                template : new sap.ui.core.Item({
                                    key : "{TimezoneId}",
                                    text : "{TimezoneName}"
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