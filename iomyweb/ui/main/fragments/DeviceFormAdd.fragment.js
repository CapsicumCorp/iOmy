sap.ui.jsfragment("fragments.DeviceFormAdd", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oView = oController.getView();
        
        var oFragContent = new sap.ui.layout.form.Form( oView.createId("DevTypeBlock_Form"),{
            editable: true,
            layout : new sap.ui.layout.form.ResponsiveGridLayout ({
                labelSpanXL: 3,
                labelSpanL: 3,
                labelSpanM: 3,
                labelSpanS: 12,
                adjustLabelSpan: false,
                emptySpanXL: 3,
                emptySpanL: 2,
                emptySpanM: 0,
                emptySpanS: 0,
                columnsXL: 1,
                columnsL: 1,
                columnsM: 1,
                columnsS: 1,
                singleContainerFullSize: false
            }),
            toolbar : new sap.m.Toolbar({
                content : [
                    new sap.m.Title ({
                        text: "Device Type"
                    })
                ]
            }).addStyleClass("MarBottom1d0Rem"),
            formContainers : [
                new sap.ui.layout.form.FormContainer({
                    formElements : [
                        new sap.ui.layout.form.FormElement(oView.createId("DeviceTypeFormElement"), {
                            label : "",
                            fields: [ 

                            ]
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