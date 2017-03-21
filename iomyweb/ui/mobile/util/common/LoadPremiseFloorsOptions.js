/*
Title: Extension of IOMy.common Library with Premise Floor Count Options
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Function to insert properties and methods specific to a particular
    Thing. Part of the IOMy.common core module.
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

$.sap.declare("IOMy.common.LoadPremiseFloorsOptions",true);

$.extend(IOMy.common,{
    
    bPremiseFloorsOptionsLoaded  : false,
    PremiseFloorsOptions         : [],
    
    /**
     * Loads all the premise floor count options into memory.
     */
    LoadPremiseFloorsOptions : function (mSettings) {
        var me = this;
        var fnSuccess;
        var fnFail;
        
        //--------------------------------------------------------------------//
        // Check the settings map for the two callback functions.
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //-- Success callback --//
            if (mSettings.onSuccess === undefined) {
                fnSuccess = function () {};
            } else {
                fnSuccess = mSettings.onSuccess;
            }
            
            //-- Failure callback --//
            if (mSettings.onFail === undefined) {
                fnFail = function () {};
            } else {
                fnFail = mSettings.onFail;
            }
        } else {
            fnSuccess   = function () {};
            fnFail      = function () {};
        }
        
        //--------------------------------------------------------------------//
        // Call the OData that returns a list of options for the number of
        // floors in a premise.
        //--------------------------------------------------------------------//
        IOMy.apiodata.AjaxRequest({
            Url : IOMy.apiodata.ODataLocation("premise_floors"),
            Columns : ["PREMISEFLOORS_PK", "PREMISEFLOORS_NAME"],
            WhereClause : [],
            OrderByClause : [],

            onSuccess : function (responseType, data) {
                try {
                    me.PremiseFloorsOptions = [];
                    
                    for (var i = 0; i < data.length; i++) {
                        me.PremiseFloorsOptions.push({
                            FloorsCount   : data[i].PREMISEFLOORS_NAME,
                            FloorsCountId : data[i].PREMISEFLOORS_PK
                        });
                    }

                    me.bPremiseFloorsOptionsLoaded = true;
                    
                    // Call the success callback function
                    fnSuccess();
                } catch (eLoadVariableError) {
                    jQuery.sap.log.error("Error gathering premise floor count: "+JSON.stringify(eLoadVariableError.message));
                    me.bPremiseFloorsOptionsLoaded = false;
                    
                    // Call the failure callback function
                    fnFail();
                }
            },

            onFail : function (response) {
                jQuery.sap.log.error("Error loading premise floor count OData: "+JSON.stringify(response));
                me.bPremiseFloorsOptionsLoaded = false;
                
                // Call the failure callback function
                fnFail();
            }
        });
        
    }
    
});