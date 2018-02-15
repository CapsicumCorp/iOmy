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

sap.ui.controller("pages.premise.PremiseForm", {
    aFormFragments      : {},
    iPremiseId          : null,
    mPremiseAddress     : {},
    
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf pages.template.Template
*/

    onInit: function() {
        var oController = this;            //-- SCOPE: Allows subfunctions to access the current scope --//
        var oView = this.getView();
        
        
        
        oView.addEventDelegate({

            onBeforeShow: function ( oEvent ) {
                //-- Store the Current Id --//
                if (oEvent.data.PremiseId !== undefined && oEvent.data.PremiseId !== null) {
                    oController.iPremiseId = oEvent.data.PremiseId;
                    
                } else {
                    iomy.common.showError("Premise has not been specified.", "");
                }
                
                //-- Refresh Nav Buttons --//
                //MyApp.common.NavigationRefreshButtons( oController );
                
                //-- Update the Model --//
                //oController.RefreshModel( oController, {} );
                //-- Check the parameters --//
                oController.ToggleButtonsAndView( oController, "ShowInfo");
                oController.ToggleButtonsAndView( oController, "ShowAddress");
                
                //-- Defines the Device Type --//
                iomy.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
                
                oController.loadLocaleInfo();
            }
            
        });
        
    },
    
    TogglePremiseInfoControls : function (bEnabled) {
        var oView           = this.getView();
        var oPremiseObject  = oView.getModel().getProperty("/Information/");
        
        try {
            $.each(oPremiseObject, function (sKey) {
                if (oView.byId("Select"+sKey) !== undefined) {
                    oView.byId("Select"+sKey).setEnabled(bEnabled);
                }

                if (oView.byId("Input"+sKey) !== undefined) {
                    oView.byId("Input"+sKey).setEnabled(bEnabled);
                }
            });
        } catch (e) {
            $.sap.log.error("Error toggling premise information controls: " + e.message);
        }
    },
    
    TogglePremiseAddressControls : function (bEnabled) {
        var oView           = this.getView();
        var oPremiseObject  = oView.getModel().getProperty("/Address/");
        
        try {
            $.each(oPremiseObject, function (sKey) {
                if (oView.byId("Select"+sKey) !== undefined) {
                    oView.byId("Select"+sKey).setEnabled(bEnabled);
                }

                if (oView.byId("Input"+sKey) !== undefined) {
                    oView.byId("Input"+sKey).setEnabled(bEnabled);
                }
            });
        } catch (e) {
            $.sap.log.error("Error toggling premise address controls: " + e.message);
        }
    },
    
    loadLocaleInfo : function (mSettings) {
        var oController = this;
        var fnComplete = function () {};
        
        try {
            if (mSettings !== undefined && mSettings !== null) {
                if (mSettings.onComplete !== undefined && mSettings.onComplete !== null) {
                    fnComplete = mSettings.onComplete;
                }
            }

            iomy.apiodata.AjaxRequest({
                Url : iomy.apiodata.ODataLocation("premiselocation"),
                Columns : ["REGION_NAME", "REGION_PK", "LANGUAGE_PK", "LANGUAGE_NAME", 
                            "PREMISEADDRESS_POSTCODE", "PREMISEADDRESS_SUBREGION",
                            "TIMEZONE_PK", "TIMEZONE_TZ", "PREMISEADDRESS_LINE1", "PREMISEADDRESS_LINE2",
                            "PREMISEADDRESS_LINE3", "PREMISEADDRESS_PK"],
                WhereClause : ["PREMISE_PK eq "+oController.iPremiseId],
                OrderByClause : [],

                onSuccess : function (responseType, data) {
                    var data = data[0];
                    oController.mPremiseAddress = {
                        "AddressId"         : data.PREMISEADDRESS_PK,
                        "RegionId"          : data.REGION_PK,
                        "RegionName"        : data.REGION_NAME,
                        "LanguageId"        : data.LANGUAGE_PK,
                        "LanguageName"      : data.LANGUAGE_NAME,
                        "PostCode"          : data.PREMISEADDRESS_POSTCODE,
                        "Subregion"         : data.PREMISEADDRESS_SUBREGION,
                        "TimezoneId"        : data.TIMEZONE_PK,
                        "TimezoneName"      : data.TIMEZONE_TZ,
                        "AddressLine1"      : data.PREMISEADDRESS_LINE1,
                        "AddressLine2"      : data.PREMISEADDRESS_LINE2,
                        "AddressLine3"      : data.PREMISEADDRESS_LINE3
                    };

                    oController.RefreshModel();
                    fnComplete();
                },

                onFail : function (response) {
                    iomy.common.showError(response.responseText, "Failed to load premise address",
                        function () {
                            oController.RefreshModel();
                            fnComplete();
                        }
                    );

                    jQuery.sap.log.error(JSON.stringify(response));
                }
            });
            
        } catch (e) {
            $.sap.log.error("Error attempting to load the address information ("+e.name+"): " + e.message);
        }
    },
    
    RefreshModel : function () {
        var oController = this;
        var oView       = oController.getView();
        var mPremise    = JSON.parse( JSON.stringify(iomy.common.PremiseList["_"+oController.iPremiseId]) );
        var oModel      = {};
        
        try {
            oModel = new sap.ui.model.json.JSONModel({
                "Information"   : mPremise,
                "Address"       : oController.mPremiseAddress,
                "Options"       : {
                    "BedroomCount"  : iomy.common.PremiseBedroomsOptions,
                    "FloorCount"    : iomy.common.PremiseFloorsOptions,
                    "OccupantCount" : iomy.common.PremiseOccupantsOptions,
                    "RoomCount"     : iomy.common.PremiseRoomsOptions,

                    "Regions"   : iomy.common.Regions,
                    "Languages" : iomy.common.Languages,
                    "Timezones" : iomy.common.Timezones
                }
            });
            
            oModel.setSizeLimit(420);
            oView.setModel(oModel);
            
        } catch (e) {
            $.sap.log.error("Error refreshing the model ("+e.name+"): " + e.message);
        }

    },
    
    ToggleButtonsAndView: function ( oController, sMode ) {
        var oView = this.getView();
        
        //console.log(sMode);
        try {    
            switch(sMode) {
                case "ShowInfo":
                    //-- Show Info --//
                    oView.byId("InfoBlock_BtnEdit").setVisible( true );
                    oView.byId("InfoBlock_BtnSave").setVisible( false );
                    oView.byId("InfoBlock_BtnCancel").setVisible( false );
                    iomy.forms.ToggleFormMode(oController, "InfoBlock_Form", false);
                    iomy.common.ShowFormFragment( oController, "premise.InfoDisplay", "InfoBlock_Form", "FormContainer" );
                break;
                case "EditInfo":
                    //-- Edit Info --//
                    oView.byId("InfoBlock_BtnEdit").setVisible( false );
                    oView.byId("InfoBlock_BtnSave").setVisible( true );
                    oView.byId("InfoBlock_BtnCancel").setVisible( true );
                    iomy.forms.ToggleFormMode(oController, "InfoBlock_Form", true);
                    iomy.common.ShowFormFragment( oController, "premise.InfoEdit", "InfoBlock_Form", "FormContainer" );
                break;
                case "ShowAddress":
                    //-- Show Address --//
                    oView.byId("AddrBlock_BtnEdit").setVisible( true );
                    oView.byId("AddrBlock_BtnSave").setVisible( false );
                    oView.byId("AddrBlock_BtnCancel").setVisible( false );
                    iomy.forms.ToggleFormMode(oController, "AddrBlock_Form", false);
                    iomy.common.ShowFormFragment( oController, "premise.AddressDisplay", "AddrBlock_Form", "FormContainer" );
                break;
                case "EditAddress":
                    //-- Edit Address --//
                    oView.byId("AddrBlock_BtnEdit").setVisible( false );
                    oView.byId("AddrBlock_BtnSave").setVisible( true );
                    oView.byId("AddrBlock_BtnCancel").setVisible( true );
                    iomy.forms.ToggleFormMode(oController, "AddrBlock_Form", true);
                    iomy.common.ShowFormFragment( oController, "premise.AddressEdit", "AddrBlock_Form", "FormContainer" );
                break;
                default:
                    $.sap.log.error("ToggleButtonsAndView: Critcal Error. sMode set incorrectly:"+sMode);
            }
        } catch(e1) {
            $.sap.log.error("ToggleButtonsAndView: Critcal Error:"+e1.message);
            return false;
        }
    },
    
    SubmitPremiseInformation : function () {
        var oController         = this;
        var oView               = oController.getView();
        var oFormData           = oView.getModel().getProperty("/Information/");
        
        oController.TogglePremiseInfoControls(false);
        
        try {
            oController.editPremiseInformation({
                premiseID       : oController.iPremiseId,
                name            : oFormData.Name,
                description     : oFormData.Desc,
                bedrooms        : oFormData.BedroomCountId,
                floors          : oFormData.FloorCountId,
                occupants       : oFormData.OccupantCountId,
                rooms           : oFormData.RoomCountId,

                onSuccess : function () {
                    try {
                        iomy.common.RefreshCoreVariables({

                            onSuccess : function () {
                                iomy.common.showMessage({
                                    text : "Premise information successfully updated."
                                });

                                oController.RefreshModel();
                                oController.ToggleButtonsAndView( oController, "ShowInfo" );
                            }

                        });
                    } catch (e) {
                        $.sap.log.error("Error attempting to reload the core variables ("+e.name+"): " + e.message);
                    }
                },

                onWarning : function (sErrMessage) {
                    iomy.common.showWarning(sErrMessage, "Some fields couldn't be updated",
                        function () {
                            oController.TogglePremiseInfoControls(true);
                        }
                    );
                },

                onFail : function (sErrMessage) {
                    iomy.common.showError(sErrMessage, "Failed to update premise",
                        function () {
                            oController.TogglePremiseInfoControls(true);
                        }
                    );
                }
            });
        } catch (e) {
            iomy.common.showError(e.message, "Error",
                function () {
                    oController.TogglePremiseInfoControls(true);
                }
            );
        }
    },
    
    SubmitPremiseAddress : function () {
        var oController         = this;
        var oView               = oController.getView();
        var oFormData           = oView.getModel().getProperty("/Address/");
        
        oController.TogglePremiseAddressControls(false);
        
        try {
            oController.editPremiseAddress({
                premiseID           : oController.iPremiseId,
                addressLine1        : oFormData.AddressLine1,
                addressLine2        : oFormData.AddressLine2,
                addressLine3        : oFormData.AddressLine3,
                regionID            : oFormData.RegionId,
                subregion           : oFormData.Subregion,
                postCode            : oFormData.PostCode,
                timezoneID          : oFormData.TimezoneId,
                languageID          : oFormData.LanguageId,

                onSuccess : function () {
                    try {
                        iomy.common.RefreshCoreVariables({

                            onSuccess : function () {
                                iomy.common.showMessage({
                                    text : "Premise address successfully updated."
                                });

                                oController.RefreshModel();
                                oController.ToggleButtonsAndView( oController, "ShowAddress" );
                                oController.loadLocaleInfo();
                            }

                        });
                    } catch (e) {
                        $.sap.log.error("Error attempting to reload the core variables ("+e.name+"): " + e.message);
                    }
                },

                onFail : function (sErrMessage) {
                    iomy.common.showError(sErrMessage, "Failed to update premise address",
                        function () {
                            oController.TogglePremiseAddressControls(true);
                        }
                    );
                }
            });
        } catch (e) {
            iomy.common.showError(e.message, "Error",
                function () {
                    oController.TogglePremiseInfoControls(true);
                }
            );
        }
    },
    
    editPremiseInformation : function (mSettings) {
        var bError                  = false;
        var aErrorMessages          = [];
        
        var sUrl                    = iomy.apiphp.APILocation("premises");
        var iPremiseId              = 0;
        var sPremiseName            = "";
        var sPremiseDesc            = "";
        var iBedroomCount           = 0;
        var iFloorCount             = 0;
        var iOccupantCount          = 0;
        var iRoomCount              = 0;
        
        var aRequests               = [];
        var oRequestQueue           = null;
        var fnSuccess               = function () {};
        var fnWarning               = function () {};
        var fnFail                  = function () {};
        
        var sMissingIDError             = "Premise ID must be specified (premiseID).";
        var sMissingNameError           = "Premise name must be given (name).";
        var sMissingBedroomCountError   = "Bedroom count must be given (bedrooms).";
        var sMissingFloorCountError     = "Floor count must be given (floors).";
        var sMissingOccupantCountError  = "Occupant count must be given (occupants).";
        var sMissingRoomCountError      = "Room count must be given (rooms).";
        
        var fnAppendError = function (sErrorMessage) {
            bError = true;
            aErrorMessages.push(sErrorMessage);
        };
        
        var fnOnSuccessErrorCheck   = function (type, data) {
            if (data.Error) {
                aErrorMessages.push(data.ErrMesg);
            }
        };
        
        var fnOnFailErrorCheck = function (response) {
            aErrorMessages.push(response.responseText);
        };
        
        //--------------------------------------------------------------------//
        // Process the settings map.
        //--------------------------------------------------------------------//
        if (mSettings !== undefined && mSettings !== null) {
            //----------------------------------------------------------------//
            // Validate the premise ID.
            //----------------------------------------------------------------//
            if (mSettings.premiseID !== undefined && mSettings.premiseID !== null) {
                iPremiseId = mSettings.premiseID;
                
                var mPremiseIDInfo = iomy.validation.isPremiseIDValid(iPremiseId);
                
                if (!mPremiseIDInfo.bIsValid) {
                    bError = true;
                    aErrorMessages = aErrorMessages.concat(mPremiseIDInfo.aErrorMessages);
                }
                
            } else {
                fnAppendError(sMissingIDError);
            }
            
            //----------------------------------------------------------------//
            // Find the new premise name.
            //----------------------------------------------------------------//
            if (mSettings.name !== undefined && mSettings.name !== null) {
                sPremiseName = mSettings.name;
            } else {
                fnAppendError(sMissingNameError);
            }
            
            //----------------------------------------------------------------//
            // Find the number of bedrooms it is supposed to have.
            //----------------------------------------------------------------//
            if (mSettings.bedrooms !== undefined && mSettings.bedrooms !== null) {
                iBedroomCount = mSettings.bedrooms;
                
                if (isNaN(iBedroomCount)) {
                    fnAppendError("'bedrooms' contains non-numeric characters");
                }
            } else {
                fnAppendError(sMissingBedroomCountError);
            }
            
            //----------------------------------------------------------------//
            // Find the number of floors it is supposed to have.
            //----------------------------------------------------------------//
            if (mSettings.floors !== undefined && mSettings.floors !== null) {
                iFloorCount = mSettings.floors;
                
                if (isNaN(iFloorCount)) {
                    fnAppendError("'floors' contains non-numeric characters");
                }
            } else {
                fnAppendError(sMissingFloorCountError);
            }
            
            //----------------------------------------------------------------//
            // Find the number of occupants it is supposed to have.
            //----------------------------------------------------------------//
            if (mSettings.occupants !== undefined && mSettings.occupants !== null) {
                iOccupantCount = mSettings.occupants;
                
                if (isNaN(iOccupantCount)) {
                    fnAppendError("'occupants' contains non-numeric characters");
                }
            } else {
                fnAppendError(sMissingOccupantCountError);
            }
            
            //----------------------------------------------------------------//
            // Find the number of rooms it is supposed to have.
            //----------------------------------------------------------------//
            if (mSettings.rooms !== undefined && mSettings.rooms !== null) {
                iRoomCount = mSettings.rooms;
                
                if (isNaN(iRoomCount)) {
                    fnAppendError("'rooms' contains non-numeric characters");
                }
            } else {
                fnAppendError(sMissingRoomCountError);
            }
            
            //----------------------------------------------------------------//
            // If there are any errors, throw the exception because there's no
            // point processing the optional arguments if the required ones are
            // either absent or invalid.
            //----------------------------------------------------------------//
            if (bError) {
                throw new IllegalArgumentException(aErrorMessages.join('\n'));
            }
            
            //----------------------------------------------------------------//
            // Find the description, otherwise there is no description.
            //----------------------------------------------------------------//
            if (mSettings.description !== undefined && mSettings.description !== null) {
                sPremiseDesc = mSettings.description;
            }
            
            //----------------------------------------------------------------//
            // Fetch the success callback if one is given
            //----------------------------------------------------------------//
            if (mSettings.onSuccess !== undefined && mSettings.onSuccess !== null) {
                fnSuccess = mSettings.onSuccess;
            }
            
            //----------------------------------------------------------------//
            // Fetch the warning callback for partial success if one is given.
            //----------------------------------------------------------------//
            if (mSettings.onWarning !== undefined && mSettings.onWarning !== null) {
                fnWarning = mSettings.onWarning;
            }
            
            //----------------------------------------------------------------//
            // Fetch the failure callback if one is given.
            //----------------------------------------------------------------//
            if (mSettings.onFail !== undefined && mSettings.onFail !== null) {
                fnFail = mSettings.onFail;
            }
            
        } else {
            fnAppendError(sMissingIDError);
            fnAppendError(sMissingNameError);
            fnAppendError(sMissingBedroomCountError);
            fnAppendError(sMissingFloorCountError);
            fnAppendError(sMissingOccupantCountError);
            fnAppendError(sMissingRoomCountError);
            
            throw new MissingSettingsMapException(aErrorMessages.join('\n'));
        }
        
        //--------------------------------------------------------------------//
        // Prepare the requests.
        //--------------------------------------------------------------------//
        aRequests = [
            //-- Edit Name --//
            {
                library : "php",
                url     : sUrl,
                data    : {
                    "Mode" : "EditName",
                    "Id" : iPremiseId,
                    "Name" : sPremiseName
                },
                
                onSuccess   : fnOnSuccessErrorCheck,
                onFail      : fnOnFailErrorCheck
            },
            
            //-- Edit Description --//
            {
                library : "php",
                url     : sUrl,
                data    : {
                    "Mode" : "EditDesc",
                    "Id" : iPremiseId,
                    "Desc" : sPremiseDesc
                },
                
                onSuccess   : fnOnSuccessErrorCheck,
                onFail      : fnOnFailErrorCheck
            },
            
            //-- Edit Statistical Information --//
            {
                library : "php",
                url     : sUrl,
                data    : {
                    "Mode" : "EditPremiseInfo",
                    "Id" : iPremiseId,
                    "PremiseInfoBedrooms" : iBedroomCount,
                    "PremiseInfoFloors" : iFloorCount,
                    "PremiseInfoOccupants" : iOccupantCount,
                    "PremiseInfoRooms" : iRoomCount
                },
                
                onSuccess   : fnOnSuccessErrorCheck,
                onFail      : fnOnFailErrorCheck
            }
        ];
        
        //--------------------------------------------------------------------//
        // Place the requests into a request queue to run them.
        //--------------------------------------------------------------------//
        oRequestQueue = new AjaxRequestQueue({
            requests            : aRequests,
            concurrentRequests  : 3,
            
            onSuccess   : function () {
                if (aErrorMessages.length > 0) {
                    fnWarning(aErrorMessages.join('\n'));
                } else {
                    fnSuccess();
                }
            },
            
            onWarning   : function () {
                fnWarning( aErrorMessages.join('\n') );
            },
            
            onFail      : function () {
                fnFail( aErrorMessages.join('\n') );
            }
        });
        
    },
    
    editPremiseAddress : function (mSettings) {
        var bError                  = false;
        var aErrorMessages          = [];
        
        var sUrl                    = iomy.apiphp.APILocation("premises");
        var iPremiseId              = 0;
        var sAddressLine1           = "";
        var sAddressLine2           = "";
        var sAddressLine3           = "";
        var iRegionId               = 0;
        var sSubRegion              = "";
        var sPostCode               = "";
        var iTimezoneId             = 0;
        var iLanguageId             = 0;
        
        var fnSuccess               = function () {};
        var fnFail                  = function () {};
        
        var sMissingIDError         = "Premise ID must be specified (premiseID).";
        
        var fnAppendError = function (sErrorMessage) {
            bError = true;
            aErrorMessages.push(sErrorMessage);
        };
        
        //--------------------------------------------------------------------//
        // Process the settings map.
        //--------------------------------------------------------------------//
        if (mSettings !== undefined && mSettings !== null) {
            //----------------------------------------------------------------//
            // Validate the premise ID.
            //----------------------------------------------------------------//
            if (mSettings.premiseID !== undefined && mSettings.premiseID !== null) {
                iPremiseId = mSettings.premiseID;
                
                var mPremiseIDInfo = iomy.validation.isPremiseIDValid(iPremiseId);
                
                if (!mPremiseIDInfo.bIsValid) {
                    bError = true;
                    aErrorMessages = aErrorMessages.concat(mPremiseIDInfo.aErrorMessages);
                }
                
            } else {
                fnAppendError(sMissingIDError);
            }
            
            //----------------------------------------------------------------//
            // If there are any errors, throw the exception because there's no
            // point processing the optional arguments if the required ones are
            // either absent or invalid.
            //----------------------------------------------------------------//
            if (bError) {
                throw new IllegalArgumentException(aErrorMessages.join('\n'));
            }
            
            //----------------------------------------------------------------//
            // Find line 1 of the street address.
            //----------------------------------------------------------------//
            if (mSettings.addressLine1 !== undefined && mSettings.addressLine1 !== null) {
                sAddressLine1 = mSettings.addressLine1;
            }
            
            //----------------------------------------------------------------//
            // Find line 2 of the street address.
            //----------------------------------------------------------------//
            if (mSettings.addressLine2 !== undefined && mSettings.addressLine2 !== null) {
                sAddressLine2 = mSettings.addressLine2;
            }
            
            //----------------------------------------------------------------//
            // Find line 3 of the street address.
            //----------------------------------------------------------------//
            if (mSettings.addressLine3 !== undefined && mSettings.addressLine3 !== null) {
                sAddressLine3 = mSettings.addressLine3;
            }
            
            //----------------------------------------------------------------//
            // Find the region ID.
            //----------------------------------------------------------------//
            if (mSettings.regionID !== undefined && mSettings.regionID !== null) {
                iRegionId = mSettings.regionID;
            }
            
            //----------------------------------------------------------------//
            // Find the sub-region
            //----------------------------------------------------------------//
            if (mSettings.subregion !== undefined && mSettings.subregion !== null) {
                sSubRegion = mSettings.subregion;
            }
            
            //----------------------------------------------------------------//
            // Find the post code
            //----------------------------------------------------------------//
            if (mSettings.postCode !== undefined && mSettings.postCode !== null) {
                sPostCode = mSettings.postCode;
            }
            
            //----------------------------------------------------------------//
            // Find the timezone ID
            //----------------------------------------------------------------//
            if (mSettings.timezoneID !== undefined && mSettings.timezoneID !== null) {
                iTimezoneId = mSettings.timezoneID;
            }
            
            //----------------------------------------------------------------//
            // Find the language ID
            //----------------------------------------------------------------//
            if (mSettings.languageID !== undefined && mSettings.languageID !== null) {
                iLanguageId = mSettings.languageID;
            }
            
            //----------------------------------------------------------------//
            // Fetch the success callback if one is given
            //----------------------------------------------------------------//
            if (mSettings.onSuccess !== undefined && mSettings.onSuccess !== null) {
                fnSuccess = mSettings.onSuccess;
            }
            
            //----------------------------------------------------------------//
            // Fetch the failure callback if one is given.
            //----------------------------------------------------------------//
            if (mSettings.onFail !== undefined && mSettings.onFail !== null) {
                fnFail = mSettings.onFail;
            }
            
        } else {
            fnAppendError(sMissingIDError);
            
            throw new MissingSettingsMapException(aErrorMessages.join('\n'));
        }
        
        try {
            iomy.apiphp.AjaxRequest({
                url : sUrl,
                data : {
                    "Mode" : "EditPremiseAddress",
                    "Id" : iPremiseId,
                    "AddressLine1" : sAddressLine1,
                    "AddressLine2" : sAddressLine2,
                    "AddressLine3" : sAddressLine3,
                    "AddressRegion" : iRegionId,
                    "AddressSubRegion" : sSubRegion,
                    "AddressPostcode" : sPostCode,
                    "AddressTimezone" : iTimezoneId,
                    "AddressLanguage" : iLanguageId
                },
                onSuccess : function (type, data) {
                    if (data.Error !== true) {
                        fnSuccess();
                    } else {
                        fnFail(data.ErrMesg);
                    }
                },
                onFail : function (response) {
                    fnFail(response.responseText);
                }
            });
        } catch (e) {
            $.sap.log.error("Error attempting to edit the address of the premise.");
            
        }
    }
});