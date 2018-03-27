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
    bLoadingStreams : false,
	
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
                oController.aStreams = [];
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
            var sControl    = "/controlsEnabled/";
            var iHubId      = iomy.common.LookupFirstHubToUseWithTelnet();
            
            var bManagedStreamsExist    = oController.aStreams.length > 0;
            var bHubHasPermission       = iHubId > 0;

            oModel.setProperty(sControl + "Buttons",        bEnabled);
            oModel.setProperty(sControl + "IfStreamsExist", bEnabled && bHubHasPermission && bManagedStreamsExist);
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
                            var mTemp      = {};

                            if (mStream.Enabled === 1) {
                                sStateText = "Enabled";
                            }
                            
                            mTemp = {
                                "ThingId"       : mStream.ThingId,
                                "StreamId"      : mStream.StreamId,
                                "DeviceName"    : mStream.Name,
                                "Descript"      : "Onvif IP Camera",
                                "Fail"          : mStream.FailCount,
                                "Success"       : mStream.RunCount,
                                "State"         : sStateText
                            };

                            oController.aStreams.push(mTemp);
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
            "controlsEnabled"   : {
                "Buttons"           : true,
                "IfStreamsExist"    : true && bHubHasPermission && bManagedStreamsExist
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
        
        //--------------------------------------------------------------------//
        // Attempt to run the telnet command.
        //--------------------------------------------------------------------//
        try {
            oController.ToggleControls(false);
            
            //----------------------------------------------------------------//
            // The user needs permission to do this.
            //----------------------------------------------------------------//
            if (iHubId == 0) {
                throw new PermissionException("Only the owner of the premise can stop all streams at once.");
            }
            
            //----------------------------------------------------------------//
            // Run the telnet command to stop all streams.
            //----------------------------------------------------------------//
            iomy.telnet.RunCommand({
                command : "stop_all_streams",
                hubID : iHubId,
                
                onSuccess : function () {
                    iomy.common.showMessage({
                        text : "All streams have stopped."
                    });
                    
                    oController.LoadStreams();
                    oController.ToggleControls(true);
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
    
    /**
     * Generates an array of rules that are selected in the table.
     * 
     * @returns array           Rules selected in the table
     */
    getSelectedStreams : function () {
        // TODO: This can be a separate function for retrieving selected data from all tables.
        var oController         = this;
        var oView               = oController.getView();
        var oTable              = oView.byId("streamTable");
        var aSelectedIndices    = oTable.getSelectedIndices();
        var aSelectedRows       = [];
        
        try {
            var aSelectedIndices    = oTable.getSelectedIndices();
            var aCameraList         = oView.getModel().getProperty("/CameraList");

            for (var i = 0; i < aSelectedIndices.length; i++) {
                aSelectedRows.push(aCameraList[aSelectedIndices[i]]);
            }
        } catch (e) {
            $.sap.log.error("Error compiling a list of selected rows ("+e.name+"): " + e.message);
        }
        
        return aSelectedRows;
    },

    toggleSelectedStreams : function () {
        var oController         = this;
        var oView               = this.getView();
        var oRequestQueue       = null;
        var aSelectedStreams    = oController.getSelectedStreams();
        var iEnabledCount       = 0;
        var iDisabledCount      = 0;
        var iFailed             = 0;
        var aRequests           = [];
        var oModel              = oView.getModel();
        
        try {
            if (aSelectedStreams.length > 0) {
                oController.ToggleControls(false);

                //----------------------------------------------------------------//
                // Create a request for each selected stream.
                //----------------------------------------------------------------//
                for (var i = 0; i < aSelectedStreams.length; i++) {
                    var mStream = aSelectedStreams[i];
                    var iEnabled;

                    if (mStream.State === "Disabled") {
                        //-- We enable it. --//
                        iEnabled = 1;
                    } else {
                        //-- We disable it. --//
                        iEnabled = 0;
                    }

                    aRequests.push({
                        library : "php",
                        url     : iomy.apiphp.APILocation("managedstreams"),
                        data    : {
                            "Mode" : "EditStream",
                            "Id" : "1",
                            "Data" : JSON.stringify({
                                "Name" : mStream.DeviceName,
                                "Enabled" : iEnabled,
                                "StreamId" : mStream.StreamId
                            })
                        },

                        onSuccess : function () {
                            if (mStream.State === "Disabled") {
                                iEnabledCount++;

                            } else {
                                iDisabledCount++;
                            }
                        },

                        onFail : function () {
                            iFailed++;
                        }
                    });
                }

                //----------------------------------------------------------------//
                // Create the request queue to run them
                //----------------------------------------------------------------//
                oRequestQueue = new AjaxRequestQueue({
                    requests : aRequests,
                    concurrentRequests : 2,

                    onSuccess : function () {
                        try {
                            var sSuccessMessage = "";
                            var oTable              = oView.byId("streamTable");
                            var aSelectedIndices    = oTable.getSelectedIndices();

                            if (iEnabledCount > 0) {
                                sSuccessMessage += iEnabledCount;
                                
                                if (iEnabledCount === 1) {
                                    sSuccessMessage += " stream";
                                } else {
                                    sSuccessMessage += " streams";
                                }
                                
                                sSuccessMessage += " enabled";
                            }

                            if (iDisabledCount > 0) {
                                if (sSuccessMessage.length > 0) {
                                    sSuccessMessage += "\n";
                                }

                                sSuccessMessage += iDisabledCount;
                                
                                if (iDisabledCount === 1) {
                                    sSuccessMessage += " stream";
                                } else {
                                    sSuccessMessage += " streams";
                                }
                                
                                sSuccessMessage += " disabled";
                            }

                            oController.ToggleControls(true);

                            iomy.common.showMessage({
                                text : sSuccessMessage
                            });

                            for (var i = 0; i < aSelectedIndices.length; i++) {
                                var j       = aSelectedIndices[i];
                                var sKey    = "/CameraList/"+j+"/State";

                                if (oModel.getProperty(sKey) === "Enabled") {
                                    oModel.setProperty(sKey, "Disabled");
                                } else {
                                    oModel.setProperty(sKey, "Enabled");

                                }
                            }
                        } catch (e) {
                            $.sap.log.error("Failure in the success function of the request queue for changing the status of a stream. ("+e.name+"): " + e.message);
                        }
                    },

                    onWarning : function () {
                        var oQueue = this;

                        iomy.common.showWarning("Some streams could not be enabled or disabled.", "Warning",
                            function () {
                                oQueue.onSuccess();
    //                            oController.ToggleControls(true);
                            }
                        );
                    },

                    onFail : function () {
                        iomy.common.showError("Failed to enable or disable the selected streams.", "Error",
                            function () {
                                oController.ToggleControls(true);
                            }
                        );
                    }
                });
            }
        } catch (e) {
            $.sap.log.error("Failed to create and run requests to enable or disable selected streams ("+e.name+"): " + e.message);
        }
    }
});