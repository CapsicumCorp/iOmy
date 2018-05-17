sap.ui.jsfragment("fragments.OnvifCamera", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                --//
		//--------------------------------------------//
		var oFragContent = null;
		var oView = oController.getView();
		
		//--------------------------------------------//
		//-- 5.0 - CREATE UI                        --//
		//--------------------------------------------//
		oFragContent = new sap.ui.layout.form.Form( oView.createId("DevSettingsBlock_Form"),{
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
						text: "Device Settings"
					})
				]
			}).addStyleClass("MarBottom1d0Rem"),
			formContainers : [
				new sap.ui.layout.form.FormContainer({
					formElements : [
						new sap.ui.layout.form.FormElement({
							label : "Assign to Onvif Server",
							fields: [ 
								iomy.widgets.selectBoxOnvifServer(oView.createId("SelectOnvifServer"), {
									selectedKey : "{/"+oView.byId("DevTypeSelect").getSelectedKey()+"/OnvifServer}",
                                    enabled : "{/enabled/IfOnvifProfilesHaveLoaded}",
                                    change : function () {
                                        oController.LoadOnvifProfilesForSelectBoxes();
                                    }
								})
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : iomy.widgets.RequiredLabel("Stream Name"),
							fields: [ 
								new sap.m.Input(oView.createId("InputStreamName"), {
                                    value : "{/"+oView.byId("DevTypeSelect").getSelectedKey()+"/CameraName}",
                                    enabled : "{/enabled/IfOnvifProfilesFound}"
                                })
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : "Profile to use for the video stream",
							fields: [ 
								new sap.m.Select(oView.createId("SelectStreamProfile"), {
									selectedKey : "{/"+oView.byId("DevTypeSelect").getSelectedKey()+"/StreamProfile}",
                                    enabled : "{/enabled/IfOnvifProfilesFound}",
                                    items : {
                                        path : "/OnvifProfiles",
                                        template : new sap.ui.core.Item({
                                            key : "{Token}",
                                            text : "{Name}",
                                        })
                                    }
								})
							]
						}),
						new sap.ui.layout.form.FormElement({
							label : "Profile to use for thumbnails",
							fields: [ 
								new sap.m.Select(oView.createId("SelectThumbnailProfile"), {
									selectedKey : "{/"+oView.byId("DevTypeSelect").getSelectedKey()+"/ThumbnailProfile}",
                                    enabled : "{/enabled/IfOnvifProfilesFound}",
                                    items : {
                                        path : "/OnvifProfiles",
                                        template : new sap.ui.core.Item({
                                            key : "{Token}",
                                            text : "{Name}"
                                        })
                                    }
								})
							]
						}),
                        new sap.ui.layout.form.FormElement({
                            label : "Stream Authentication",
                            fields: [
                                new sap.m.Select({
                                    selectedKey : "{/"+oView.byId("DevTypeSelect").getSelectedKey()+"/StreamAuthMethod}",
                                    enabled : "{/enabled/IfOnvifProfilesFound}",
                                    items : [
                                        new sap.ui.core.Item ({
                                            key: 1,
                                            text: "No Auth Required"
                                        }),
                                        new sap.ui.core.Item ({
                                            key: 2,
                                            text: "Camera Username and Password"
                                        }),
                                        new sap.ui.core.Item ({
                                            key: 3,
                                            text: "Stream Username and Password"
                                        })
                                    ]
                                })
                            ]
                        }),
//                        new sap.ui.layout.form.FormElement({
//                            label : "Disable PTZ Controls",
//                            enabled : "{/enabled/IfOnvifProfilesFound}",
//                            fields: [
//                                new sap.m.CheckBox({
//                                    enabled : true
//                                })
//                            ]
//                        }),
						new sap.ui.layout.form.FormElement({
							label : "",
							fields: [
								new sap.m.Button (oView.createId("ButtonSubmit"), {
									type: sap.m.ButtonType.Accept,
									text: "Save",
                                    enabled : "{/enabled/IfOnvifProfilesFound}",
                                    press : function () {
                                        if (oController.bLoadingOnvifProfiles !== true) {
                                            oController.CreateDevice();
                                        }
                                    }
								}),
								new sap.m.Button (oView.createId("ButtonCancel"), {
									type: sap.m.ButtonType.Reject,
									text: "Cancel",
                                    enabled : "{/enabled/Always}",
                                    press : function () {
                                        oController.CancelInput();
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