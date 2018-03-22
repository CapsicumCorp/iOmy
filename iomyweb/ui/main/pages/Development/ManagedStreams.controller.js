/*
Title: Template UI5 Controller
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: Draws either a username and password prompt, or a loading app
    notice for the user to log into iOmy.
Copyright: Capsicum Corporation 2015, 2016

This file is part of iOmy.

iOmy is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

iOmy is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with iOmy.  If not, see <http://www.gnu.org/licenses/>.

*/
$.sap.require("sap.ui.table.Table");
sap.ui.controller("pages.Development.ManagedStreams", {
	
	aStreams : [],
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf pages.template.Template
*/

	onInit: function() {
		var oController = this;			//-- SCOPE: Allows subfunctions to access the current scope --//
		var oView = this.getView();
		
		oView.addEventDelegate({

			onBeforeShow: function ( oEvent ) {
				//-- Store the Current Id --//
				//oController.iCurrentId = oEvent.data.Id;
				
				//-- Refresh Nav Buttons --//
				//MyApp.common.NavigationRefreshButtons( oController );
				
				//-- Update the Model --//
				//oController.RefreshModel( oController, {} );
				
				//-- Check the parameters --//
				oController.LoadStreams();
				//-- Defines the Device Type --//
				iomy.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
			}
			
		});
		
	},
    
    LoadStreams : function () {
        var oController = this;
        
        //--------------------------------------------------------------------//
        // Attempt to look up the streams.
        //--------------------------------------------------------------------//
        try {
            iomy.apiphp.AjaxRequest({
                url     : iomy.apiphp.APILocation("managedstreams"),
                data    : {
                    "Mode" : "LookupStreams"
                },
                
                onSuccess : function (sType, mData) {
                    try {
                        //--------------------------------------------------------------------//
                        // Go through the list of streams.
                        //--------------------------------------------------------------------//
                        for (var i = 0; i < mData.Data.length; i++) {
                            var mStream = mData.Data[i];
                            var sStateText = "Disabled";

                            if (mStream.Enabled === 1) {
                                sStateText = "Enabled";
                            }

                            oController.aStreams.push({
                                "DeviceName": mStream.Name,
                                "Descript"  : "Onvif IP Camera",
                                "Fail"      : mStream.FailCount,
                                "Success"   : mStream.RunCount,
                                "State"     : sStateText
                            });
                        }

                        oController.RefreshModel(oController, {} );
                        
                    } catch (e) {
                        $.sap.log.error("Error occurred in the success callback ("+e.name+"): " + e.message);
                    }
                },
                
                onFail : function (response) {
                    $.sap.log.error("Error occurred while looking up streams: " + response.responseText);
                    
                    iomy.common.showError(response.responseText, "Error");
                }
            });
            
        } catch (e) {
            $.sap.log.error("Error occurred attempting to run the stream list request ("+e.name+"): " + e.message);
        }
    },
    
	RefreshModel: function( oController, oConfig ) {
		//------------------------------------------------//
		//-- Declare Variables                          --//
		//------------------------------------------------//
		var oView            = oController.getView();
		
		//------------------------------------------------//
		//-- Build and Bind Model to the View           --//
		//------------------------------------------------//
		oView.setModel( 
			new sap.ui.model.json.JSONModel({
				"CameraList":   [
					{
						"DeviceName": "Front Door Camera",
						"Descript": "Onvif IP Camera",
						"Fail"      : "1",
                        "Success"   : "13",
						"State"     : "Enabled",
					},
					{
						"DeviceName": "Back Veranda Camera",
						"Descript": "Onvif IP Camera",
						"Fail"      : "1",
                        "Success"   : "13",
						"State"     : "Enabled",
					},
					{
						"DeviceName": "Garage Camera",
						"Descript": "Onvif IP Camera",
						"Fail"      : "1",
                        "Success"   : "13",
						"State"     : "Disabled",
					}
				]
			})
		);
		
		//------------------------------------------------//
		//-- Trigger the onSuccess Event                --//
		//------------------------------------------------//
		if( oConfig.onSuccess ) {
			oConfig.onSuccess();
		}
		
	}

});