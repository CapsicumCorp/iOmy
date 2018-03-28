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
					label : iomy.widgets.RequiredLabel("Street Address"),
					fields: [
						new sap.m.Input (oView.createId("InputAddressLine1"), {
                            value : "{/Address/AddressLine1}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Unit Number (if applicable)",
					fields: [
						new sap.m.Input (oView.createId("InputAddressLine2"), {
                            value : "{/Address/AddressLine2}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "City / Suburb",
					fields: [
						new sap.m.Input (oView.createId("InputAddressLine3"), {
                            value : "{/Address/AddressLine3}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "State / Province",
					fields: [
						new sap.m.Input (oView.createId("InputSubregion"), {
                            value : "{/Address/Subregion}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Post Code / Zip Code",
					fields: [
						new sap.m.Input (oView.createId("InputPostCode"), {
                            value : "{/Address/PostCode}"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : "Country / Region",
					fields: [
						new sap.m.Select (oView.createId("SelectRegionId"), {
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