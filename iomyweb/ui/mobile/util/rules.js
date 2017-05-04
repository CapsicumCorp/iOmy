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

$.sap.declare("IOMy.rules",true);

IOMy.rules = new sap.ui.base.Object();

$.extend(IOMy.rules, {
    
    RulesList : {},
	
	doesHubSupportDeviceRules : function (iHub) {
		//--------------------------------------------------------------------//
        // Check the hub ID.
        //--------------------------------------------------------------------//
		if (iHub === undefined || iHub === null) {
			throw new MissingArgumentException("Hub ID must be specified.");
		} else if (isNaN(iHub)) {
			throw new IllegalArgumentException("Hub ID must be a number.");
		}
		
		var mHub;
		var bSupported;
		
		try {
			mHub = IOMy.common.getHub(iHub);
		} catch (ex) {
			throw ex;
		}
		
		if (mHub.HubTypeId == 2) {
			bSupported = true;
		} else {
			bSupported = false;
		}
		
		return bSupported;
	},
    
    loadRules : function (mSettings) {
        //--------------------------------------------------------------------//
        // Declare and initialise variables
        //--------------------------------------------------------------------//
		var me				= this;
        var bError          = false;
        var aErrorMessages  = [];
        var sURL            = IOMy.apiphp.APILocation("devicerules");
        var iHub;
		var mHub;
        var fnSuccess;
        var fnFail;
        
        var fnAppendError = function (sErrMesg) {
            bError = true;
            aErrorMessages.push(sErrMesg);
        };
        
        //--------------------------------------------------------------------//
        // Check that all the parameters are there
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //----------------------------------------------------------------//
            // REQUIRED: Find the hub ID and verify that it is a valid type.
            //----------------------------------------------------------------//
            if (mSettings.hubID === undefined || mSettings.hubID === null) {
                fnAppendError("A Hub must be specified.");
            } else {
                iHub = mSettings.hubID;
            }
			
			try {
				mHub = IOMy.common.getHub(iHub);
				
				if (mHub.HubTypeId !== 2) {
					fnAppendError("The given hub does not support device rules.");
				}
			} catch (ex) {
				// Most likely it couldn't find the hub
				if (ex.name === "HubNotFoundException") {
					fnAppendError("Hub doesn't exist!");
				} else {
					// Another exception was thrown that wasn't expected. Rethrow.
					throw ex;
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
            // OPTIONAL: Find the onFail callback function
            //----------------------------------------------------------------//
            if (mSettings.onFail === undefined) {
                fnFail = function () {};
            } else {
                fnFail = mSettings.onFail;
            }
            
        } else {
            throw new MissingSettingsMapException();
        }
        
        IOMy.apiphp.AjaxRequest({
            
            url : sURL,
            data : {
                "Mode"  : "FetchConfigArray",
                "HubId" : iHub
            },
            
            onSuccess : function (type, data) {
                
                try {
                    
                    if (data.Error === false) {
                        var aData = data.Data.timerules;
                        var mRule = {};
                        
                        for (var i = 0; i < aData.length; i++) {
                            mRule = aData[i];
                            
                            IOMy.rules.RulesList[mRule.Serial] = mRule;
                        }
                        
                        if (aData.length === 0) {
                            jQuery.sap.log.warning("No rules to load.");
                        }
                        
                        fnSuccess();
                        
                    } else {
                        var sErrMessage = "Error loading rules from API: " + data.ErrMesg;
                        jQuery.sap.log.error(sErrMessage);
                        fnFail(sErrMessage);
                        
                    }
                    
                } catch (Exception) {
                    
                    var sErrMessage = "Error loading rules in memory: " + Exception.message;
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
        
    },
    
    saveRules : function (mSettings) {
        //--------------------------------------------------------------------//
        // Declare and initialise variables
        //--------------------------------------------------------------------//
        var bError          = false;
        var aErrorMessages  = [];
        var sURL            = IOMy.apiphp.APILocation("devicerules");
        var aTimeRules      = [];
        var mRulesConfig;
        var iHub;
        var fnSuccess;
        var fnFail;
        
        var fnAppendError = function (sErrMesg) {
            bError = true;
            aErrorMessages.push(sErrMesg);
        };
        
        //--------------------------------------------------------------------//
        // Check that all the parameters are there
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //----------------------------------------------------------------//
            // REQUIRED: Find the hub ID
            //----------------------------------------------------------------//
            if (mSettings.hubID === undefined || mSettings.hubID === null) {
                fnAppendError("A Hub must be specified.");
            } else {
                iHub = mSettings.hubID;
            }
            
            //----------------------------------------------------------------//
            // Check for errors and throw an exception if there are errors.
            //----------------------------------------------------------------//
            if (bError) {
                throw new MissingArgumentException("* "+aErrorMessages.join("\n* "));
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Find the onBefore callback function and execute it
            //----------------------------------------------------------------//
            if (mSettings.onBefore !== undefined) {
                mSettings.onBefore();
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
            throw new MissingSettingsMapException();
        }
        
        //--------------------------------------------------------------------//
        // Compose an array of rules out of the associative array
        //--------------------------------------------------------------------//
        $.each(IOMy.rules.RulesList, function (sSerialCode, mRuleInfo) {
            
            if (sSerialCode !== undefined && sSerialCode !== null &&
                mRuleInfo !== undefined && mRuleInfo !== null)
            {
                aTimeRules.push(mRuleInfo);
            }
            
        });
        
        mRulesConfig        = {
            "timerules":aTimeRules
        };
        
        //--------------------------------------------------------------------//
        // Update the rules file.
        //--------------------------------------------------------------------//
        IOMy.apiphp.AjaxRequest({
            
            url : sURL,
            data : {
                "Mode"  : "SaveConfigArray",
                "HubId" : iHub,
                "RulesConfig" : JSON.stringify(mRulesConfig)
            },
            
            onSuccess : function (responseType, responseData) {
                
                try {
                    
                    if (responseData.Error === false) {
                        
                        // Run the telnet command to reload the rules file
                        IOMy.telnet.RunCommand({
                            "command"   : "timerules_reload",
                            "onSuccess" : fnSuccess,
                            "onFail"    : fnFail
                        });
                        
                    } else {
                        var sErrMessage = "Error saving rules through API: " + responseData.ErrMesg;
                        jQuery.sap.log.error(sErrMessage);
                        fnFail(sErrMessage);
                    }
                    
                } catch (Exception) {
                    
                    var sErrMessage = "Error saving rules from memory: " + Exception.message;
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
    },
    
    applyRule : function (mSettings) {
        //--------------------------------------------------------------------//
        // Declare and initialise variables
        //--------------------------------------------------------------------//
        var bError          = false;
        var aErrorMessages  = [];
        var me              = this;
        var mRule           = {"Type" : "DeviceTimeRule"};
        var sSerialCode;
        
        var fnAppendError = function (sErrMesg) {
            bError = true;
            aErrorMessages.push(sErrMesg);
        };
        
        //--------------------------------------------------------------------//
        // Check that all the parameters are there
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //----------------------------------------------------------------//
            // REQUIRED: Find the hub ID
            //----------------------------------------------------------------//
            if (mSettings.hubID === undefined || mSettings.hubID === null) {
                fnAppendError("A Hub must be specified.");
            }
            
            //----------------------------------------------------------------//
            // REQUIRED: Find the rule
            //----------------------------------------------------------------//
            if (mSettings.rule === undefined || mSettings.rule === null) {
                fnAppendError("A rule must be specified.");
                
            } else {
                //------------------------------------------------------------//
                // REQUIRED: Find the serial code
                //------------------------------------------------------------//
                if (mSettings.rule.Serial === undefined || mSettings.rule.Serial === null) {
                    fnAppendError("The serial number for the device must be specified.");
                } else {
                    sSerialCode = mSettings.rule.Serial;
                    mRule.Serial = sSerialCode;
                }
                
                //------------------------------------------------------------//
                // REQUIRED: Find the time to turn the device on
                //------------------------------------------------------------//
                if (mSettings.rule.Ontime === undefined || mSettings.rule.Ontime === null) {
                    fnAppendError("The time the device turns on must be specified.");
                } else {
                    mRule.Ontime = mSettings.rule.Ontime;
                }
                
                //------------------------------------------------------------//
                // REQUIRED: Find the time to turn the device off
                //------------------------------------------------------------//
                if (mSettings.rule.Offtime === undefined || mSettings.rule.Offtime === null) {
                    fnAppendError("The time the device turns off must be specified.");
                } else {
                    mRule.Offtime = mSettings.rule.Offtime;
                }
            }
            
            //----------------------------------------------------------------//
            // Check for errors and throw an exception if there are errors.
            //----------------------------------------------------------------//
            if (bError) {
                throw new MissingArgumentException("* "+aErrorMessages.join("\n* "));
            }
            
        } else {
            throw new MissingSettingsMapException();
        }
        
        //--------------------------------------------------------------------//
        // Apply the rule to memory and save the changes.
        //--------------------------------------------------------------------//
        try {
            me.RulesList[ sSerialCode ] = mRule;

            me.saveRules(mSettings);
        } catch (error) {
            //----------------------------------------------------------------//
            // Rethrow the exception because the required parameters have
            // already been checked. There is something else wrong.
            //----------------------------------------------------------------//
            throw error;
        }
    },
    
    discardRule : function (mSettings) {
        
        var bError          = false;
        var aErrorMessages  = [];
        var me              = this;
        var sSerialCode;
        
        var fnAppendError = function (sErrMesg) {
            bError = true;
            aErrorMessages.push(sErrMesg);
        };
        
        //--------------------------------------------------------------------//
        // Check that all the parameters are there
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //----------------------------------------------------------------//
            // REQUIRED: Find the hub ID
            //----------------------------------------------------------------//
            if (mSettings.hubID === undefined || mSettings.hubID === null) {
                fnAppendError("A Hub must be specified.");
            }
            
            //----------------------------------------------------------------//
            // REQUIRED: Find the serial code
            //----------------------------------------------------------------//
            if (mSettings.Serial === undefined || mSettings.Serial === null) {
                fnAppendError("The serial number for the device must be specified.");
            } else {
                sSerialCode = mSettings.Serial;
            }
            
            //----------------------------------------------------------------//
            // Check for errors and throw an exception if there are errors.
            //----------------------------------------------------------------//
            if (bError) {
                throw new MissingArgumentException("* "+aErrorMessages.join("\n* "));
            }
            
        } else {
            throw new MissingSettingsMapException();
        }
        
        //--------------------------------------------------------------------//
        // Remove the rule from memory and save the changes.
        //--------------------------------------------------------------------//
        try {
            delete me.RulesList[ sSerialCode ];

            me.saveRules(mSettings);
        } catch (error) {
            //----------------------------------------------------------------//
            // Rethrow the exception because the required parameters have
            // already been checked. There is something else wrong.
            //----------------------------------------------------------------//
            throw error;
        }
    }
    
});

//----------------------------------------//
//-- LOAD RULE FUNCTIONS                --//
//----------------------------------------//

//----------------------------------------------------------------------------//
// Rule management
//----------------------------------------------------------------------------//
//$.sap.registerModulePath('IOMy.rules', sModuleInitialBuildLocation+'util/validation');
//$.sap.require("IOMy.rules.addRule");
//
//$.sap.registerModulePath('IOMy.rules', sModuleInitialBuildLocation+'util/validation');
//$.sap.require("IOMy.rules.editRule");
//
//$.sap.registerModulePath('IOMy.rules', sModuleInitialBuildLocation+'util/validation');
//$.sap.require("IOMy.rules.deleteRule");