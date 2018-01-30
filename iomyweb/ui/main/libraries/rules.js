/*
Title: Rule Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Contains a library for handling device rules for home automation.
Copyright: Capsicum Corporation 2017

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

$.sap.declare("IomyRe.rules",true);

IomyRe.rules = new sap.ui.base.Object();

$.extend(IomyRe.rules, {
    
    RulesList : {},
    
    getRuleTypeName : function (iRuleTypeId) {
        var sName = null;
        
        try {
            if (iRuleTypeId == 1) {
                sName = "Turn On (One-time)";
            } else if (iRuleTypeId == 2) {
                sName = "Turn Off (One-time)";
            } else if (iRuleTypeId == 3) {
                sName = "Turn On (Recurring)";
            } else if (iRuleTypeId == 4) {
                sName = "Turn Off (Recurring)";
            } else if (iRuleTypeId < 1 || iRuleTypeId > 4) {
                throw new IllegalArgumentException("Rule type ID must be between 1 and 4.");
            }
            
        } catch (e) {
            sName = null;
            $.sap.log.error("Failed to get the name of the rule type ("+e.name+"): " + e.message);
            
        } finally {
            return sName;
        }
    },
	
    /**
     * Checks a given hub to check whether the rules feature can be used for
     * the hub.
     * 
     * @param {type} iHub       ID of the hub
     * @returns {Boolean}       Whether the hub is supported or not
     */
	doesHubSupportDeviceRules : function (iHub) {
		//--------------------------------------------------------------------//
        // Check the hub ID.
        //--------------------------------------------------------------------//
        try {
            if (iHub === undefined || iHub === null) {
                throw new MissingArgumentException("Hub ID must be specified.");
            } else if (isNaN(iHub)) {
                throw new IllegalArgumentException("Hub ID must be a number.");
            }

            var mHub;
            var bSupported;

            mHub = IomyRe.common.getHub(iHub);

            if (mHub.HubTypeId == 2) {
                bSupported = true;
            } else {
                bSupported = false;
            }
        } catch (e) {
            bSupported = false;
            $.sap.log.error("Failed to find if the hub supports rules.");
            
        } finally {
            return bSupported;
        }
	},
    
    /**
     * Loads the list of supported devices that can have rules applied to it.
     * 
     * @returns {object}        Associative array of supported devices.
     */
    loadSupportedDevices : function () {
        var aDevices   = [];
        
        try {
            $.each(IomyRe.common.ThingList, function (sI, mThing) {
                if (mThing.TypeId == IomyRe.devices.zigbeesmartplug.ThingTypeId) {
                    aDevices.push(mThing);
                }
            });
            
        } catch (e) {
            aDevices = [];
            $.sap.log.error("Error loading supported devices for rules ("+e.name+"): " + e.message);
            
        } finally {
            return aDevices;
        }
    },
    
    /**
     * Loads all of the rules into memory.
     * 
     * Required parameters in mSettings:
     * 
     * hubID                : ID of the hub
     * 
     * Optional parameters:
     * 
     * onSuccess            : function to run if the rules have loaded successfully
     * onFail(sErrMesg)     : function to run after an error is encountered. Accepts an error message as a parameter.
     * 
     * @param {type} mSettings          Map containing parameters
     */
    loadRules : function (mSettings) {
        //--------------------------------------------------------------------//
        // Declare and initialise variables
        //--------------------------------------------------------------------//
        var bError          = false;
        var aErrorMessages  = [];
        var sURL            = IomyRe.apiphp.APILocation("hubrules");
        //var iHub            = null;
        var sMode           = "ListAllRules";
		//var mHub;
        var fnSuccess;
        var fnFail;
        
        //var sHubMissing = "A Hub (hubID) must be specified.";
        
        var fnAppendError = function (sErrMesg) {
            bError = true;
            aErrorMessages.push(sErrMesg);
        };
        
        //--------------------------------------------------------------------//
        // Check that all the parameters are there
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
//            //----------------------------------------------------------------//
//            // REQUIRED: Find the hub ID and verify that it is a valid type.
//            //----------------------------------------------------------------//
//            if (mSettings.hubID === undefined || mSettings.hubID === null) {
//                fnAppendError(sHubMissing);
//            } else {
//                iHub = mSettings.hubID;
//                
//                var mHubInfo = IomyRe.validation.isHubIDValid(iHub);
//                
//                if (mHubInfo.bIsValid) {
//                    mHub = IomyRe.common.HubList["_"+iHub];
//				
//                    if (mHub.HubTypeId != 2) {
//                        fnAppendError("The given hub does not support device rules.");
//                    }
//                } else {
//                    bError = true;
//                    aErrorMessages = aErrorMessages.concat(mHubInfo.aErrorMessages);
//                }
//            }
            
            if (IomyRe.validation.isValueGiven(mSettings.enabledOnly)) {
                if (mSettings.enabledOnly === true) {
                    sMode = "ListAllActiveRules";
                } else {
                    sMode = "ListAllRules";
                }
            } else {
                sMode = "ListAllRules";
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Find the onSuccess callback function
            //----------------------------------------------------------------//
            if (mSettings.onSuccess === undefined) {
                fnSuccess = function () {};
            } else {
                fnSuccess = mSettings.onSuccess;
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Find the onFail callback function
            //----------------------------------------------------------------//
            if (mSettings.onFail === undefined) {
                fnFail = function () {};
            } else {
                fnFail = mSettings.onFail;
            }
            
        } else {
            //fnAppendError(sHubMissing);
            throw new MissingSettingsMapException(aErrorMessages.join("\n\n"));
        }
        
        try {
            IomyRe.rules.RulesList = {};
            
            //--------------------------------------------------------------------//
            // Run the API to acquire the list of rules.
            //--------------------------------------------------------------------//
            IomyRe.apiphp.AjaxRequest({

                url : sURL,
                data : {
                    "Mode"  : sMode,
                    //"HubId" : iHub
                },

                onSuccess : function (type, data) {

                    try {

                        if (data.Error === false) {
                            //----------------------------------------------------//
                            // Create the list of rules identified by the serial
                            // numbers of the devices.
                            //----------------------------------------------------//
                            var aRules = data.Data;
                            var mRule = {};

                            for (var i = 0; i < aRules.length; i++) {
                                mRule = aRules[i];

                                IomyRe.rules.RulesList["_"+mRule.Id] = mRule;
                            }

                            fnSuccess();

                        } else {
                            var sErrMessage = "Error loading rules from API: " + data.ErrMesg;
                            jQuery.sap.log.error(sErrMessage);
                            fnFail(sErrMessage);

                        }

                    } catch (e) {

                        var sErrMessage = "Error loading rules in memory: " + e.message;
                        jQuery.sap.log.error(sErrMessage);
                        fnFail(sErrMessage);

                    }

                },

                onFail : function (error) {
                    var sErrMessage = "Error accessing the rules API: " + error.responseText;
                    jQuery.sap.log.error(sErrMessage);
                    fnFail(sErrMessage);
                }

            });
        } catch (e) {
            var sErrMessage = "Error attempting to load rules ("+e.name+"): " + e.message;
            $.sap.log.error(sErrMessage);
            fnFail(sErrMessage);
        }
        
    },
    
    /**
     * Creates a new rule. Requires a name, time, type of event, 
     * 
     * @param {type} mSettings          Map containing parameters
     */
    addRule : function (mSettings) {
        //--------------------------------------------------------------------//
        // Declare and initialise variables
        //--------------------------------------------------------------------//
        var oModule             = this;
        var bError              = false;
        var aErrorMessages      = [];
        var sURL                = IomyRe.apiphp.APILocation("hubrules");
        var iHub                = null;
        var sMode               = "AddRule";
        var fnSuccess           = function () {};
        var fnWarning           = function () {};
        var fnFail              = function () {};
        var iEnabled            = true;
        var iThingId;
        var sTime;
        var sRuleName;
        var iRuleTypeId;
		var mHub;
        var mThing;
        
        var sThingMissing   = "A Device (thingID) must be specified.";
        var sTimeMissing    = "A time must be given.";
        var sNameMissing    = "The rule must have a name.";
        var sTypeMissing    = "The type of rule must be specified.";
        
        var fnAppendError = function (sErrMesg) {
            bError = true;
            aErrorMessages.push(sErrMesg);
        };
        
        //--------------------------------------------------------------------//
        // Check that all the parameters are there
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
//            //----------------------------------------------------------------//
//            // Find the hub ID and verify that it is a valid type.
//            //----------------------------------------------------------------//
//            if (mSettings.hubID === undefined || mSettings.hubID === null) {
//                fnAppendError(sHubMissing);
//            } else {
//                iHub = mSettings.hubID;
//                
//                var mHubInfo = IomyRe.validation.isHubIDValid(iHub);
//                
//                if (mHubInfo.bIsValid) {
//                    mHub = IomyRe.common.HubList["_"+iHub];
//				
//                    if (mHub.HubTypeId != 2) {
//                        fnAppendError("The given hub does not support device rules.");
//                    }
//                } else {
//                    bError = true;
//                    aErrorMessages = aErrorMessages.concat(mHubInfo.aErrorMessages);
//                }
//            }
            
            //----------------------------------------------------------------//
            // Find the thing ID and verify that it is a valid type.
            //----------------------------------------------------------------//
            if (mSettings.thingID === undefined || mSettings.thingID === null) {
                fnAppendError(sThingMissing);
            } else {
                iThingId = parseInt(mSettings.thingID);
                
                var mThingInfo = IomyRe.validation.isThingIDValid(iThingId);
                
                if (mThingInfo.bIsValid) {
                    mThing = IomyRe.common.ThingList["_"+iThingId];
                    mHub = IomyRe.functions.getHubConnectedToThing(iThingId);
				
                    if (mThing.TypeId != IomyRe.devices.zigbeesmartplug.ThingTypeId) {
                        fnAppendError("The given device is not supported.");
                    }
                    
                    // TODO: Perhaps check the hub type as the supported devices is being constructed.
                    if (mHub.HubTypeId != 2) {
                        fnAppendError("The hub the device is attached to does not support device rules.");
                    } else {
                        iHub = mHub.HubId;
                    }
                    
                } else {
                    bError = true;
                    aErrorMessages = aErrorMessages.concat(mThingInfo.aErrorMessages);
                }
            }
            
            //----------------------------------------------------------------//
            // Get the time
            //----------------------------------------------------------------//
            if (IomyRe.validation.isValueGiven(mSettings.time) && mSettings.time !== "") {
                sTime = mSettings.time;
            } else {
                fnAppendError(sTimeMissing);
            }
            
            //----------------------------------------------------------------//
            // Get the name of the rule
            //----------------------------------------------------------------//
            if (IomyRe.validation.isValueGiven(mSettings.name) && mSettings.name !== "") {
                sRuleName = mSettings.name;
            } else {
                fnAppendError(sNameMissing);
            }
            
            //----------------------------------------------------------------//
            // Get the rule type ID
            //----------------------------------------------------------------//
            if (IomyRe.validation.isValueGiven(mSettings.ruleTypeID)) {
                iRuleTypeId = mSettings.ruleTypeID;
            } else {
                fnAppendError(sTypeMissing);
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Find the 'enabled' flag to have this rule enabled or
            // disabled. Default is true
            //----------------------------------------------------------------//
            if (mSettings.enabled !== undefined) {
                iEnabled = mSettings.enabled;
                
                if (iEnabled) {
                    iEnabled = 1;
                } else {
                    iEnabled = 0;
                }
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Find the onSuccess callback function
            //----------------------------------------------------------------//
            if (mSettings.onSuccess === undefined) {
                fnSuccess = function () {};
            } else {
                fnSuccess = mSettings.onSuccess;
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Find the onFail callback function
            //----------------------------------------------------------------//
            if (mSettings.onFail === undefined) {
                fnFail = function () {};
            } else {
                fnFail = mSettings.onFail;
            }
            
            if (bError) {
                throw new IllegalArgumentException(aErrorMessages.join("\n\n"));
            }
            
        } else {
            fnAppendError(sThingMissing);
            fnAppendError(sNameMissing);
            fnAppendError(sTimeMissing);
            fnAppendError(sTypeMissing);
            
            throw new MissingSettingsMapException(aErrorMessages.join("\n\n"));
        }
        
        try {
            //--------------------------------------------------------------------//
            // Run the API to add a rule.
            //--------------------------------------------------------------------//
            IomyRe.apiphp.AjaxRequest({

                url : sURL,
                data : {
                    "Mode"  : sMode,
                    "HubId" : iHub,
                    "Data"  : JSON.stringify({
                        "Enabled":iEnabled,
                        "Time":sTime,
                        "Name":sRuleName,
                        "RuleTypeId":iRuleTypeId,
                        "Parameter":{'ThingId':iThingId}
                    })
                },

                onSuccess : function (type, data) {

                    try {

                        if (data.Error === false) {
                            oModule.loadRules({
                                onSuccess : function () {
                                    fnSuccess();
                                },

                                onFail : function (sErrMessage) {
                                    fnWarning(sErrMessage);
                                }
                            });

                        } else {
                            var sErrMessage = "Error adding a rule: " + data.ErrMesg;
                            jQuery.sap.log.error(sErrMessage);
                            fnFail(sErrMessage);

                        }

                    } catch (e) {

                        var sErrMessage = "Error after creating a rule: " + e.message;
                        jQuery.sap.log.error(sErrMessage);
                        fnFail(sErrMessage);

                    }

                },

                onFail : function (error) {
                    var sErrMessage = "Error accessing the rules API: " + error.responseText;
                    jQuery.sap.log.error(sErrMessage);
                    fnFail(sErrMessage);
                }

            });
        } catch (e) {
            var sErrMessage = "Error attempting to add a rule ("+e.name+"): " + e.message;
            jQuery.sap.log.error(sErrMessage);
            fnFail(sErrMessage);
        }
        
    },
    
    editRule : function (mSettings) {
        //--------------------------------------------------------------------//
        // Declare and initialise variables
        //--------------------------------------------------------------------//
        var oModule             = this;
        var bError              = false;
        var aErrorMessages      = [];
        var sURL                = IomyRe.apiphp.APILocation("hubrules");
        var sMode               = "EditRule";
        var fnSuccess           = function () {};
        var fnWarning           = function () {};
        var fnFail              = function () {};
        var iEnabled            = 1;
        var iRuleId;
        var sTime;
        var sRuleName;
        var iRuleTypeId;
        
        var sRuleMissing    = "A Rule (hubID) must be specified.";
        var sTimeMissing    = "A time must be given.";
        var sNameMissing    = "The rule must have a name.";
        var sTypeMissing    = "The type of rule must be specified.";
        
        var fnAppendError = function (sErrMesg) {
            bError = true;
            aErrorMessages.push(sErrMesg);
        };
        
        //--------------------------------------------------------------------//
        // Check that all the parameters are there
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //----------------------------------------------------------------//
            // Find the thing ID and verify that it is a valid type.
            //----------------------------------------------------------------//
            if (IomyRe.validation.isValueGiven(mSettings.ruleID)) {
                iRuleId = mSettings.ruleID;
            } else {
                fnAppendError(sRuleMissing);
            }
            
            //----------------------------------------------------------------//
            // Get the time.
            //----------------------------------------------------------------//
            if (IomyRe.validation.isValueGiven(mSettings.time) && mSettings.time !== "") {
                sTime = mSettings.time;
            } else {
                fnAppendError(sTimeMissing);
            }
            
            //----------------------------------------------------------------//
            // Get the name of the rule.
            //----------------------------------------------------------------//
            if (IomyRe.validation.isValueGiven(mSettings.name) && mSettings.name !== "") {
                sRuleName = mSettings.name;
            } else {
                fnAppendError(sNameMissing);
            }
            
            //----------------------------------------------------------------//
            // Get the rule type ID.
            //----------------------------------------------------------------//
            if (IomyRe.validation.isValueGiven(mSettings.ruleTypeID)) {
                iRuleTypeId = mSettings.ruleTypeID;
            } else {
                fnAppendError(sTypeMissing);
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Find the 'enabled' flag to have this rule enabled or
            // disabled. Default is true.
            //----------------------------------------------------------------//
            if (mSettings.enabled !== undefined) {
                iEnabled = mSettings.enabled;
                
                if (iEnabled) {
                    iEnabled = 1;
                } else {
                    iEnabled = 0;
                }
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Find the onSuccess callback function.
            //----------------------------------------------------------------//
            if (mSettings.onSuccess === undefined) {
                fnSuccess = function () {};
            } else {
                fnSuccess = mSettings.onSuccess;
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Find the onFail callback function.
            //----------------------------------------------------------------//
            if (mSettings.onFail === undefined) {
                fnFail = function () {};
            } else {
                fnFail = mSettings.onFail;
            }
            
            if (bError) {
                throw new IllegalArgumentException(aErrorMessages.join("\n\n"));
            }
            
        } else {
            fnAppendError(sRuleMissing);
            fnAppendError(sTimeMissing);
            fnAppendError(sNameMissing);
            fnAppendError(sTypeMissing);
            
            throw new MissingSettingsMapException(aErrorMessages.join("\n\n"));
        }
        
        try {
            //--------------------------------------------------------------------//
            // Run the API to edit a rule.
            //--------------------------------------------------------------------//
            IomyRe.apiphp.AjaxRequest({

                url : sURL,
                data : {
                    "Mode"  : sMode,
                    "Id"    : iRuleId,
                    "Data"  : JSON.stringify({
                        "Enabled":iEnabled,
                        "Time":sTime,
                        "Name":sRuleName,
                        "RuleTypeId":iRuleTypeId
                    })
                },

                onSuccess : function (type, data) {

                    try {

                        if (data.Error === false) {
                            oModule.loadRules({
                                onSuccess : function () {
                                    fnSuccess();
                                },

                                onFail : function (sErrMessage) {
                                    fnWarning(sErrMessage);
                                }
                            });

                        } else {
                            var sErrMessage = "Error editing a rule: " + data.ErrMesg;
                            jQuery.sap.log.error(sErrMessage);
                            fnFail(sErrMessage);

                        }

                    } catch (e) {

                        var sErrMessage = "Error after editing a rule: " + e.message;
                        jQuery.sap.log.error(sErrMessage);
                        fnFail(sErrMessage);

                    }

                },

                onFail : function (error) {
                    var sErrMessage = "Error accessing the rules API: " + error.responseText;
                    jQuery.sap.log.error(sErrMessage);
                    fnFail(sErrMessage);
                }

            });
        } catch (e) {
            var sErrMessage = "Error attempting to edit a rule ("+e.name+"): " + e.message;
            jQuery.sap.log.error(sErrMessage);
            fnFail(sErrMessage);
        }
        
    },
    
    discardRules : function (mSettings) {
        var bError              = false;
        var aErrorMessages      = [];
        var oModule             = this;
        var aRuleIDs            = [];
        var aDiscardRequests    = [];
        var oRequestQueue       = null;
        var fnSuccess           = function () {};
        var fnWarning           = function () {};
        var fnFail              = function () {};
        
        var sRuleMissing        = "Rule IDs must be specified.";
        
        var fnAppendError = function (sErrMesg) {
            bError = true;
            aErrorMessages.push(sErrMesg);
        };
        
        //--------------------------------------------------------------------//
        // Check that all the parameters are there
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //----------------------------------------------------------------//
            // REQUIRED: Find the rule ID
            //----------------------------------------------------------------//
            if (mSettings.ruleIDs === undefined || mSettings.ruleIDs === null) {
                fnAppendError(sRuleMissing);
            } else {
                if (typeof mSettings.ruleIDs === "string" || typeof mSettings.ruleIDs === "number") {
                    aRuleIDs.push(mSettings.ruleIDs);
                } else if (mSettings.ruleIDs instanceof Array) {
                    aRuleIDs = mSettings.ruleIDs;
                } else {
                    fnAppendError("Invalid 'ruleIDs' parameter parsed. Type given: " + typeof mSettings.ruleIDs);
                }
            }
            
            //----------------------------------------------------------------//
            // Check for errors and throw an exception if there are errors.
            //----------------------------------------------------------------//
            if (bError) {
                throw new MissingArgumentException("* "+aErrorMessages.join("\n* "));
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Find the onSuccess callback function
            //----------------------------------------------------------------//
            if (mSettings.onSuccess === undefined) {
                fnSuccess = function () {};
            } else {
                fnSuccess = mSettings.onSuccess;
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Find the onWarning callback function
            //----------------------------------------------------------------//
            if (mSettings.onWarning === undefined) {
                fnWarning = function () {};
            } else {
                fnWarning = mSettings.onWarning;
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Find the onFail callback function
            //----------------------------------------------------------------//
            if (mSettings.onFail === undefined) {
                fnFail = function () {};
            } else {
                fnFail = mSettings.onFail;
            }
            
        } else {
            fnAppendError(sRuleMissing);
            
            throw new MissingSettingsMapException("* "+aErrorMessages.join("\n* "));
        }
        
        try {
            //--------------------------------------------------------------------//
            // Process each rule for removal.
            //--------------------------------------------------------------------//
            for (var i = 0; i < aRuleIDs.length; i++) {
                aDiscardRequests.push({
                    library : "php",
                    url : IomyRe.apiphp.APILocation("hubrules"),
                    data : {
                        Mode : "DeleteRule",
                        Id : aRuleIDs[i]
                    },
                    
                    onSuccess : function (sType, mData) {
                        try {
                            if (sType === "JSON") {
                                if (!mData.Error) {
                                    delete IomyRe.rules.RulesList["_"+aRuleIDs[i]];
                                    
                                } else {
                                    aErrorMessages.push("Error after a successful API call: " + mData.ErrMesg);
                                }
                                
                            } else {
                                aErrorMessages.push("A successful call to the rules API did not return a JSON response. Received " + sType + ".");
                            }
                            
                        } catch (e) {
                            aErrorMessages.push("Error after a successful API call ("+e.name+"): " + e.message);
                        }
                    },
                    
                    onFail : function (response) {
                        aErrorMessages.push(response.responseText);
                    }
                });
            }
            
            //--------------------------------------------------------------------//
            // Create the queue and run each request. Reload the rules list from
            // the database afterward.
            //--------------------------------------------------------------------//
            oRequestQueue = new AjaxRequestQueue({
                requests                : aDiscardRequests,
                concurrentRequests      : 2,
                
                onSuccess : function () {
                    try {
                        oModule.loadRules({
                            onSuccess : function () {
                                if (aErrorMessages.length > 0) {
                                    fnWarning(aErrorMessages.join("\n"));
                                } else {
                                    fnSuccess();
                                }
                            },
                            
                            onFail : function (sErrMessage) {
                                aErrorMessages.push(sErrMessage);
                                fnWarning(aErrorMessages.join("\n"));
                            }
                        });
                    } catch (e) {
                        aErrorMessages.push("Error attempting to reload rules ("+e.name+"): " + e.message);
                        fnWarning(aErrorMessages.join("\n"));
                    }
                },
                
                onWarning : function () {
                    try {
                        oModule.loadRules({
                            onSuccess : function () {
                                fnWarning(aErrorMessages.join("\n"));
                            },
                            
                            onFail : function (sErrMessage) {
                                aErrorMessages.push(sErrMessage);
                                fnWarning(aErrorMessages.join("\n"));
                            }
                        });
                    } catch (e) {
                        aErrorMessages.push("Error attempting to reload rules ("+e.name+"): " + e.message);
                        fnWarning(aErrorMessages.join("\n"));
                    }
                },
                
                onFail : function () {
                    fnFail("Failed to discard rule(s):\n\n"+aErrorMessages.join("\n"));
                }
            });
            
        } catch (e) {
            fnFail("Failed to process rules ("+e.name+"): " + e.message);
            
        }
    },
    
    toggleRules : function (mSettings) {
        var bError              = false;
        var aErrorMessages      = [];
        var oModule             = this;
        var aRuleIDs            = [];
        var aToggleRequests     = [];
        var iEnabled            = 0;
        var oRequestQueue       = null;
        var fnSuccess           = function () {};
        var fnWarning           = function () {};
        var fnFail              = function () {};
        
        var sRuleMissing        = "Rule IDs must be specified.";
        
        var fnAppendError = function (sErrMesg) {
            bError = true;
            aErrorMessages.push(sErrMesg);
        };
        
        //--------------------------------------------------------------------//
        // Check that all the parameters are there
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //----------------------------------------------------------------//
            // REQUIRED: Find the rule ID
            //----------------------------------------------------------------//
            if (mSettings.ruleIDs === undefined || mSettings.ruleIDs === null) {
                fnAppendError(sRuleMissing);
            } else {
                if (typeof mSettings.ruleIDs === "string" || typeof mSettings.ruleIDs === "number") {
                    aRuleIDs.push(mSettings.ruleIDs);
                } else if (mSettings.ruleIDs instanceof Array) {
                    aRuleIDs = mSettings.ruleIDs;
                } else {
                    fnAppendError("Invalid 'ruleIDs' parameter parsed. Type given: " + typeof mSettings.ruleIDs);
                }
            }
            
            //----------------------------------------------------------------//
            // Check for errors and throw an exception if there are errors.
            //----------------------------------------------------------------//
            if (bError) {
                throw new MissingArgumentException("* "+aErrorMessages.join("\n* "));
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Find the onSuccess callback function
            //----------------------------------------------------------------//
            if (mSettings.onSuccess === undefined) {
                fnSuccess = function () {};
            } else {
                fnSuccess = mSettings.onSuccess;
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Find the onWarning callback function
            //----------------------------------------------------------------//
            if (mSettings.onWarning === undefined) {
                fnWarning = function () {};
            } else {
                fnWarning = mSettings.onWarning;
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Find the onFail callback function
            //----------------------------------------------------------------//
            if (mSettings.onFail === undefined) {
                fnFail = function () {};
            } else {
                fnFail = mSettings.onFail;
            }
            
        } else {
            fnAppendError(sRuleMissing);
            
            throw new MissingSettingsMapException("* "+aErrorMessages.join("\n* "));
        }
        
        try {
            //--------------------------------------------------------------------//
            // Process each rule for removal.
            //--------------------------------------------------------------------//
            for (var i = 0; i < aRuleIDs.length; i++) {
                iEnabled = (IomyRe.rules.RulesList["_"+aRuleIDs[i]].Enabled + 1) % 2;
                
                aToggleRequests.push({
                    library : "php",
                    url : IomyRe.apiphp.APILocation("hubrules"),
                    data : {
                        Mode : "SetRuleEnabled",
                        Id : aRuleIDs[i],
                        Data : JSON.stringify({ 'Enabled' : iEnabled })
                    },
                    
                    onSuccess : function (sType, mData) {
                        try {
                            if (sType === "JSON") {
                                if (mData.Error) {
                                    aErrorMessages.push("Error after a successful API call: " + mData.ErrMesg);
                                }
                                
                            } else {
                                aErrorMessages.push("A successful call to the rules API did not return a JSON response. Received " + sType + ".");
                            }
                            
                        } catch (e) {
                            aErrorMessages.push("Error after a successful API call ("+e.name+"): " + e.message);
                        }
                    },
                    
                    onFail : function (response) {
                        aErrorMessages.push(response.responseText);
                    }
                });
            }
            
            //--------------------------------------------------------------------//
            // Create the queue and run each request. Reload the rules list from
            // the database afterward.
            //--------------------------------------------------------------------//
            oRequestQueue = new AjaxRequestQueue({
                requests                : aToggleRequests,
                concurrentRequests      : 2,
                
                onSuccess : function () {
                    try {
                        oModule.loadRules({
                            onSuccess : function () {
                                if (aErrorMessages.length > 0) {
                                    fnWarning(aErrorMessages.join("\n"));
                                } else {
                                    fnSuccess();
                                }
                            },
                            
                            onFail : function (sErrMessage) {
                                aErrorMessages.push(sErrMessage);
                                fnWarning(aErrorMessages.join("\n"));
                            }
                        });
                    } catch (e) {
                        aErrorMessages.push("Error attempting to reload rules ("+e.name+"): " + e.message);
                        fnWarning(aErrorMessages.join("\n"));
                    }
                },
                
                onWarning : function () {
                    try {
                        oModule.loadRules({
                            onSuccess : function () {
                                fnWarning(aErrorMessages.join("\n"));
                            },
                            
                            onFail : function (sErrMessage) {
                                aErrorMessages.push(sErrMessage);
                                fnWarning(aErrorMessages.join("\n"));
                            }
                        });
                    } catch (e) {
                        aErrorMessages.push("Error attempting to reload rules ("+e.name+"): " + e.message);
                        fnWarning(aErrorMessages.join("\n"));
                    }
                },
                
                onFail : function () {
                    fnFail("Failed to enable/disable rule(s):\n\n"+aErrorMessages.join("\n"));
                }
            });
            
        } catch (e) {
            fnFail("Failed to process rules ("+e.name+"): " + e.message);
            
        }
    }
    
});
