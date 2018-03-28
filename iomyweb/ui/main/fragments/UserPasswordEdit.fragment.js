sap.ui.jsfragment("fragments.UserPasswordEdit", {
	
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
					label : iomy.widgets.RequiredLabel("Current Password"),
					fields: [
						new sap.m.Input (oView.createId("InputOldPassword"), {
							value: "{/Password/OldPassword}",
                            type: "Password"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : iomy.widgets.RequiredLabel("New Password"),
					fields: [
						new sap.m.Input (oView.createId("InputNewPassword"), {
							value: "{/Password/NewPassword}",
                            type: "Password"
						})
					]
				}),
				new sap.ui.layout.form.FormElement({
					label : iomy.widgets.RequiredLabel("Confirm Password"),
					fields: [
						new sap.m.Input (oView.createId("InputConfirmPassword"), {
							value: "{/Password/ConfirmPassword}",
                            type: "Password"
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