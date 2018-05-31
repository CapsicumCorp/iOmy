sap.ui.jsfragment("fragments.premise.AddressEdit", {
	
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
					label : "Language",
					fields: [
						new sap.m.Select (oView.createId("SelectLanguageId"), {
                            enabled : "{/enabled/Always}",
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
						new sap.m.Input (oView.createId("InputAddressLine1"), {
                            enabled : "{/enabled/Always}",
                            value : "{/Address/AddressLine1}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Unit Number",
					fields: [
						new sap.m.Input (oView.createId("InputAddressLine2"), {
                            enabled : "{/enabled/Always}",
                            value : "{/Address/AddressLine2}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "City / Suburb",
					fields: [
						new sap.m.Input (oView.createId("InputAddressLine3"), {
                            enabled : "{/enabled/Always}",
                            value : "{/Address/AddressLine3}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "State / Province",
					fields: [
						new sap.m.Input (oView.createId("InputSubregion"), {
                            enabled : "{/enabled/Always}",
                            value : "{/Address/Subregion}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Post Code / Zip Code",
					fields: [
						new sap.m.Input (oView.createId("InputPostCode"), {
                            enabled : "{/enabled/Always}",
                            value : "{/Address/PostCode}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Country / Region",
					fields: [
						new sap.m.Select (oView.createId("SelectRegionId"), {
							enabled : "{/enabled/Always}",
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
						new sap.m.Select (oView.createId("SelectTimezoneId"), {
							enabled : "{/enabled/Always}",
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