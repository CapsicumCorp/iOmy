sap.ui.jsfragment("fragments.EditOnvifStreamSettings", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oFragContent = null;
        var oView = oController.getView();
		
		
		//--------------------------------------------//
		//-- 5.0 - CREATE UI                        --//
		//--------------------------------------------//
		oFragContent = new sap.ui.layout.form.Form({
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
                        text : "Camera Settings"
                    }),
                ]
            }).addStyleClass("MarBottom1d0Rem"),
            formContainers : [
                new sap.ui.layout.form.FormContainer({
                    formElements : [
                        new sap.ui.layout.form.FormElement({
                            label : "Stream Authentication",
                            fields: [
                                new sap.m.Select({
                                    enabled : "{/enabled/IfAllowed}",
                                    selectedKey : "{/fields/streamAuthType}",
                                    items : [
                                        new sap.ui.core.Item ({
                                            key: 0,
                                            text: "No Auth Required"
                                        }),
                                        new sap.ui.core.Item ({
                                            key: 1,
                                            text: "Camera Username and Password"
                                        }),
                                        new sap.ui.core.Item ({
                                            key: 2,
                                            text: "Stream Username and Password"
                                        })
                                    ],

                                    change : function () {
                                        oController.ToggleOnvifStreamAuthenticationForm();
                                    }
                                })
                            ]
                        }),
                        new sap.ui.layout.form.FormElement({
                            label : iomy.widgets.RequiredLabel("Stream Username"),
                            visible : "{/visible/IfStreamAuthSelected}",
                            fields: [ 
                                new sap.m.Input({
                                    value : "{/fields/streamUsername}",
                                    enabled : "{/enabled/IfAllowed}"
                                })
                            ]
                        }),
                        new sap.ui.layout.form.FormElement({
                            label : "Stream Password",
                            visible : "{/visible/IfStreamAuthSelected}",
                            fields: [
                                new sap.m.Input({
                                    value : "{/fields/streamPassword}",
                                    enabled : "{/enabled/IfAllowed}",
                                    type : sap.m.InputType.Password
                                })
                            ]
                        }),
                        new sap.ui.layout.form.FormElement({
                            label : "Disable PTZ Controls",
                            fields: [
                                new sap.m.CheckBox({
                                    enabled : "{/enabled/IfAllowed}",
                                    selected : "{/fields/ptzDisabled}",
                                })
                            ]
                        }),
                        new sap.ui.layout.form.FormElement({
                            label: "",
                            fields: [
                                new sap.m.Button ({
                                    text: "Update",
                                    type: sap.m.ButtonType.Accept,
                                    enabled : "{/enabled/IfAllowed}",
                                    press : function () {
                                        oController.SaveStreamSettings();
                                    }
                                }),
                                new sap.m.Button ({
                                    text: "Revert",
                                    type: sap.m.ButtonType.Reject,
                                    enabled : "{/enabled/Always}",

                                    press : function () {
                                        oController.LoadStreamSettings();
                                    }
                                })
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