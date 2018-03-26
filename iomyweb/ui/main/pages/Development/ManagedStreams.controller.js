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
                oController.RefreshModel(oController, {});
				oController.LoadStreams();
				//-- Defines the Device Type --//
				iomy.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
			}
			
		});
		
	},
    
    ToggleControls : function (bEnabled) {
        try {
            var oController = this;
            var oView       = this.getView();
            var oModel      = oView.getModel();
            var sControl    = "/enabledControls/";
            var iHubId      = iomy.common.LookupFirstHubToUseWithTelnet();
            
            var bManagedStreamsExist    = oController.aStreams.length > 0;
            var bHubHasPermission       = iHubId > 0;

            oModel.setProperty(sControl + "Buttons",    bEnabled);
            oModel.setProperty(sControl + "StopAllBtn", bEnabled && bHubHasPermission && bManagedStreamsExist);
        } catch (e) {
            $.sap.log.error("Error enabling or disabling controls ("+e.name+"): " + e.message);
        }
    },
    
    LoadStreams : function () {
        var oController = this;
        var iHubId      = iomy.common.LookupFirstHubToUseWithTelnet();
        
        oController.ToggleControls(false);
        
        //--------------------------------------------------------------------//
        // Attempt to look up the streams.
        //--------------------------------------------------------------------//
        try {
            if (iHubId == 0) {
                throw new PermissionException("You have no permission to access the managed stream list.");
            }
            
            iomy.apiphp.AjaxRequest({
                url     : iomy.apiphp.APILocation("managedstreams"),
                data    : {
                    "Mode" : "LookupStreams",
                    "Id" : iHubId
                },
                
                onSuccess : function (sType, mData) {
                    try {
                        oController.aStreams = [];
                        
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
                                "ThingId"       : mStream.ThingId,
                                "CameraLibId"   : mStream.Id,
                                "DeviceName"    : mStream.Name,
                                "Descript"      : "Onvif IP Camera",
                                "Fail"          : mStream.FailCount,
                                "Success"       : mStream.RunCount,
                                "State"         : sStateText
                            });
                        }

                        oController.ToggleControls(true);
                        oController.RefreshModel(oController, {} );
                        
                    } catch (e) {
                        $.sap.log.error("Error occurred in the success callback ("+e.name+"): " + e.message);
                        oController.ToggleControls(true);
                    }
                },
                
                onFail : function (response) {
                    $.sap.log.error("Error occurred while looking up streams: " + response.responseText);
                    
                    iomy.common.showError(response.responseText, "Error",
                        function () {
                            oController.ToggleControls(true);
                        }
                    );
                }
            });
            
        } catch (e) {
            $.sap.log.error("Error occurred attempting to run the stream list request ("+e.name+"): " + e.message);
            iomy.common.showError(e.message, "Error",
                function () {
                    oController.ToggleControls(true);
                }
            );
        }
    },
    
	RefreshModel: function( oController, oConfig ) {
		//------------------------------------------------//
		//-- Declare Variables                          --//
		//------------------------------------------------//
		var oView           = oController.getView();
        var oModel          = null;
        var oModelData      = {};
        var iHubId          = iomy.common.LookupFirstHubToUseWithTelnet();
        
        var bManagedStreamsExist    = oController.aStreams.length > 0;
        var bHubHasPermission       = iHubId > 0;
		
		//------------------------------------------------//
		//-- Build and Bind Model to the View           --//
		//------------------------------------------------//
		oModelData = {
            "CameraList"        : oController.aStreams,
            "enabledControls"   : {
                "Buttons"       : true,
                "StopAllBtn"    : true && bHubHasPermission && bManagedStreamsExist
            }
        };
        
		oModel = new sap.ui.model.json.JSONModel(oModelData);
        oModel.setSizeLimit(420);
        oView.setModel( oModel );
		
		//------------------------------------------------//
		//-- Trigger the onSuccess Event                --//
		//------------------------------------------------//
		if( oConfig.onSuccess ) {
			oConfig.onSuccess();
		}
		
	},
    
    stopAllStreams : function () {
        var oController = this;
        var iHubId      = iomy.common.LookupFirstHubToUseWithTelnet();
        
        try {
            oController.ToggleControls(false);
            
            if (iHubId == 0) {
                throw new PermissionException("Only the owner of the premise can stop all streams at once.");
            }
            
            iomy.telnet.RunCommand({
                command : "stop_all_streams",
                hubID : iHubId,
                
                onSuccess : function () {
                    iomy.common.showMessage({
                        text : "All streams have stopped."
                    });
                    
                    oController.LoadStreams();
                },
                
                onFail : function (response) {
                    iomy.common.showError(response.responseText, "Error",
                        function () {
                            oController.ToggleControls(true);
                        }
                    );
                }
            });
            
        } catch (e) {
            iomy.common.showError(e.message, "Error",
                function () {
                    oController.ToggleControls(true);
                }
            );
        }
    },

});