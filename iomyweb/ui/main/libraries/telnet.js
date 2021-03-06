/*
Title: iOmy Telnet Library
Author: Brent (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Functions that interact with a telnet interface.
Copyright: Capsicum Corporation 2016, 2017

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

$.sap.declare("iomy.telnet",true);

iomy.telnet = new sap.ui.base.Object();

$.extend(iomy.telnet,{
    
    bRunningCommand         : false,
    TelnetLog				: {},
	
	mxExecutionCallbacks	: new Mutex(),
	iLogIndex				: 0,
    
    /**
     * Runs a telnet command to the hub.
     * 
     * @param {object}      mSettings			Parameters
     * @param {string}      mSettings.command	Telnet Command
     * @param {number}      mSettings.hubID 	ID of the Hub to interact with
     * @param {function}    mSettings.onSuccess	(Optional) Function to run if execution is successful
     * @param {function}    mSettings.onFail	(Optional) Function to run upon failure
     */
    RunCommand : function (mSettings) {
        //--------------------------------------------------------------------//
        // Import modules and widgets.
        //--------------------------------------------------------------------//
        var oModule         = this;
        var bError          = false;
        var aErrorMessages  = [];
		var iLogIndex		= oModule.iLogIndex++;
        var fnSuccess;
        var fnFail;
        
        var fnAppendError = function (sErrMesg) {
            bError = true;
            aErrorMessages.push(sErrMesg);
        };
        
        //--------------------------------------------------------------------//
        // API Parameters.
        //--------------------------------------------------------------------//
        var sUrl            = iomy.apiphp.APILocation("hubtelnet");
        var iHubId;
        var sCommand;
        
        //--------------------------------------------------------------------//
        // Check that all the parameters are there.
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //----------------------------------------------------------------//
            // REQUIRED: Find the telnet command
            //----------------------------------------------------------------//
            if (mSettings.command === undefined || mSettings.command === null) {
                fnAppendError("Telnet command not given");
            } else {
                sCommand = mSettings.command;
            }
            
            //----------------------------------------------------------------//
            // REQUIRED: Find the hub ID
            //----------------------------------------------------------------//
            if (mSettings.hubID === undefined || mSettings.hubID === null) {
                fnAppendError("'hubID' not given");
            } else {
                iHubId = mSettings.hubID;
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
            fnAppendError("Telnet command not given");
            fnAppendError("'hubID' not given");
            
            throw new MissingSettingsMapException("* "+aErrorMessages.join("\n* "));
        }
        
        // Indicating that a telnet command is running
        oModule.bRunningCommand = true;
		
		oModule.TelnetLog["_"+iLogIndex] = {
			"level" : !bError ? "I" : "E",
			"content" : "Running " + sCommand + "..."
		};
        
        try {
            iomy.apiphp.AjaxRequest({
                url : sUrl,
                data : {"Mode" : "CustomTelnetCommand", "HubId" : iHubId, "CustomCommand" : sCommand},

                onSuccess : function (dataType, data) {
                    var req = this;

                    oModule.mxExecutionCallbacks.synchronize({

                        task : function () {
                            try {
                                if (data.Error === false || data.Error === undefined) {
                                    var sOutput = "\n    " + data.Data.Custom.join("\n    ");
                                    req.logOutput(sOutput, false);

                                    iomy.rules.loadRules({
                                        hubID : iHubId
                                    });

                                    fnSuccess(sOutput);
                                } else {
                                    req.logOutput(sOutput, true);
                                    fnFail(sOutput, data.ErrMesg);
                                }
                            } catch (error) {
                                req.logOutput(error.name + ": " + error.message, true);
                                fnFail("Program Error", error.message);
                            }
                        }

                    });
                },

                onFail : function (response) {
                    var req = this;

                    oModule.mxExecutionCallbacks.synchronize({

                        task : function () {
                            var sOutput = response.responseText;
                            req.logOutput(sOutput, true);

                            fnFail(sOutput, response.responseText);
                        }

                    });
                },

                logOutput : function (sOutput, bError) {

                    if (bError) {
                        oModule.TelnetLog["_"+iLogIndex].level = "E";
                    }

                    // Insert the output into the Telnet log
                    oModule.TelnetLog["_"+iLogIndex].content = sCommand + ": " + sOutput;

                    oModule.bRunningCommand = false;
                }
            });
            
        } catch (e) {
            oModule.TelnetLog["_"+iLogIndex].level = "E";
            oModule.TelnetLog["_"+iLogIndex].content = sCommand + ": An unexpected error occurred.";

            oModule.bRunningCommand = false;
            
            fnFail("Program Error", error.message);
        }
    },
	
	compileLog : function () {
		var oModule     	= this;
		var aLog			= [];
		
        try {
            $.each(oModule.TelnetLog, function (sI, mEntry) {
                aLog.push( mEntry.level + ": " + mEntry.content );

            });

        } catch (e) {
            $.sap.log.error("Failed to completely compile the log ("+e.name+"): " + e.message);
            
        } finally {
            return aLog;
        }
	}
    
});