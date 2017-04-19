/*
Title: iOmy Telnet Library
Author: Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
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

$.sap.declare("IOMy.telnet",true);

IOMy.telnet = new sap.ui.base.Object();

$.extend(IOMy.telnet,{
    
    bRunningCommand         : false,
    ZigbeeTelnetLog         : [],
    
    /**
     * Runs a custom command via telnet to the hub.
     * 
     * @param {type} oScope
     * @param {type} oInputWidget
     * @returns {undefined}
     */
    RunCommand : function (mSettings) {
        //---------------------------------------------------------//
        // Import modules, widgets and scope                       //
        //---------------------------------------------------------//
        var me              = this;
        var php             = IOMy.apiphp;
        var bError          = false;
        var aErrorMessages  = [];
        var fnSuccess;
        var fnFail;
        
        var fnAppendError = function (sErrMesg) {
            bError = true;
            aErrorMessages.push(sErrMesg);
        };
        
        //---------------------------------------------------------//
        // API Parameters                                          //
        //---------------------------------------------------------//
        var sUrl            = php.APILocation("hubtelnet");
        var iHubId          = 1;
        var sCommand;
        
        //--------------------------------------------------------------------//
        // Check that all the parameters are there
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
        
        // Indicating that a telnet command is running
        me.bRunningCommand = true;
        
        // Insert the output into the Telnet log
        me.ZigbeeTelnetLog.push({
            "level" : "I",
            "content" : "Running "+sCommand+"...\n\n"
        });
        
        php.AjaxRequest({
            url : sUrl,
            data : {"Mode" : "CustomTelnetCommand", "HubId" : iHubId, "CustomCommand" : sCommand},
            
            onSuccess : function (dataType, data) {
                try {
                    if (data.Error === false || data.Error === undefined) {
                        var sOutput = data.Data.Custom.join("\n");
                        this.logOutput(sOutput, false);
                        
                        IOMy.rules.loadRules();
                        
                        fnSuccess();
                    } else {
                        this.logOutput(sOutput, true);
                        fnFail();
                    }
                } catch (error) {
                    this.logOutput(error.name + ": " + error.message);
                    fnFail();
                }
            },
            
            onFail : function (response) {
                var sOutput = JSON.stringify(response);
                this.logOutput(sOutput, true);
                
                fnFail();
            },
            
            logOutput : function (output, bError) {
                var sOutput = output;
                
                // Insert the output into the Telnet log
                me.ZigbeeTelnetLog.push({
                    "level" : !bError ? "I" : "E",
                    "content" : sOutput
                });
                
                me.bRunningCommand = false;
            }
        });
    },
    
});