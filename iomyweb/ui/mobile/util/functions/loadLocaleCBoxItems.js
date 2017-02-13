/*
Title: Load Locale Select Box Items
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Loads a series of select boxes with locale options specific to a
    given country.
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

$.sap.declare("IOMy.functions.loadLocaleCBoxItems",true);

//----------------------------------------------------------------------------//
// Add this function to the functions module.
//----------------------------------------------------------------------------//
$.extend(IOMy.functions,{
    
    /**
     * Procedure loads countries, languages, states and provinces, postcodes,
     * and timezones into their respective combo boxes through a series of AJAX
     * requests. What will be populated in these combo boxes depends on which
     * country the user has selected.
     * 
     * Should run every time a country is changed in a form handling locale
     * information.
     * 
     * @param {type} oView          UI5 Controller or View that has the combo boxes
     * @param {type} iCountryId     
     * @param {type} displayData
     */
    loadLocaleCBoxItems : function (oView, iCountryId, displayData) {
        var me = oView;     // Change the variable name of the scope.
        
        // Arrays to store combo box items that have been created using data
        // from the OData services.
        var aCountries = [];
        var aLanguages = [];
        var aStates = [];
        var aPostcodes = [];
        var aTimezones = [];
        
        // Gather the PK and Display text (NAME) of each country available
        me.odata.AjaxRequest({
            Url : me.odata.ODataLocation("countries"),
            Columns : ["COUNTRIES_NAME", "COUNTRIES_PK"],
            WhereClause : [],
            OrderByClause : ["COUNTRIES_NAME asc"],

            onSuccess : function (responseType, data) {
                try {
                    for (var i = 0; i < data.length; i++) {
                        aCountries.push(
                            new sap.ui.core.Item({
                                text : data[i].COUNTRIES_NAME,
                                key : data[i].COUNTRIES_PK
                            })
                        );
                    }
                } catch (e) {

                    jQuery.sap.log.error("Error gathering Countries: "+JSON.stringify(e.message));

                } finally {
                    this.onProceed(iCountryId, displayData);
                }
            },

            onFail : function (response) {
                jQuery.sap.log.error("Error loading countries OData: "+JSON.stringify(response));
                this.onProceed(iCountryId, displayData);
            },

            /**
             * These onProceed functions are called no matter whether there
             * was success or failure in running the public OData query.
             * These are used to continue the flow of execution of other
             * OData services so if there are errors with one or more, the
             * others will at least still work.
             * 
             * @param {type} iCountryId
             * @returns {undefined}
             */
            onProceed : function (iCountryId, displayData) {
                me.odata.AjaxRequest({
                    Url : me.odata.ODataLocation("language"),
                    Columns : ["LANGUAGE_PK","LANGUAGE_NAME"],
                    WhereClause : ["COUNTRIES_PK eq "+iCountryId],
                    OrderByClause : ["LANGUAGE_NAME asc"],

                    onSuccess : function (responseType, data) {
                        try {
                            for (var i = 0; i < data.length; i++) {
                                aLanguages.push(
                                    new sap.ui.core.Item({
                                        text : data[i].LANGUAGE_NAME,
                                        key : data[i].LANGUAGE_PK
                                    })
                                );
                            }
                        } catch (e) {

                            jQuery.sap.log.error("Error gathering Languages: "+JSON.stringify(e.message));

                        } finally {
                            this.onProceed(iCountryId, displayData);
                        }
                    },

                    onFail : function (response) {
                        jQuery.sap.log.error("Error loading languages OData: "+JSON.stringify(response));
                        this.onProceed(iCountryId, displayData);
                    },

                    onProceed : function (iCountryId, displayData) {
                        me.odata.AjaxRequest({
                            Url : me.odata.ODataLocation("stateprovince"),
                            Columns : ["STATEPROVINCE_PK","STATEPROVINCE_NAME"],
                            WhereClause : ["COUNTRIES_PK eq "+iCountryId],
                            OrderByClause : ["STATEPROVINCE_NAME asc"],

                            onSuccess : function (responseType, data) {
                                try {
                                    for (var i = 0; i < data.length; i++) {
                                        aStates.push(
                                            new sap.ui.core.Item({
                                                text : data[i].STATEPROVINCE_NAME,
                                                key : data[i].STATEPROVINCE_PK
                                            })
                                        );
                                    }
                                } catch (e) {

                                    jQuery.sap.log.error("Error gathering States and Provinces: "+JSON.stringify(e.message));

                                } finally {
                                    this.onProceed(iCountryId, displayData);
                                }
                            },

                            onFail : function (response) {
                                jQuery.sap.log.error("Error loading stateprovince OData: "+JSON.stringify(response));
                                this.onProceed(iCountryId, displayData);
                            },

                            onProceed : function (iCountryId, displayData) {
                                me.odata.AjaxRequest({
                                    Url : me.odata.ODataLocation("postcode"),
                                    Columns : ["POSTCODE_PK","POSTCODE_NAME"],
                                    WhereClause : ["COUNTRIES_PK eq "+iCountryId],
                                    OrderByClause : ["POSTCODE_NAME asc"],

                                    onSuccess : function (responseType, data) {
                                        try {
                                            for (var i = 0; i < data.length; i++) {
                                                aPostcodes.push(
                                                    new sap.ui.core.Item({
                                                        text : data[i].POSTCODE_NAME,
                                                        key : data[i].POSTCODE_PK
                                                    })
                                                );
                                            }
                                        } catch (e) {

                                            jQuery.sap.log.error("Error gathering Post codes: "+JSON.stringify(e.message));

                                        } finally {
                                            this.onProceed(displayData);
                                        }
                                    },

                                    onFail : function (response) {
                                        jQuery.sap.log.error("Error loading stateprovince OData: "+JSON.stringify(response));
                                        this.onProceed(displayData);
                                    },

                                    onProceed : function (displayData) {
                                        me.odata.AjaxRequest({
                                            Url : me.odata.ODataLocation("timezones"),
                                            Columns : ["TIMEZONE_PK","TIMEZONE_TZ"],
                                            WhereClause : [],
                                            OrderByClause : ["TIMEZONE_TZ asc"],

                                            onSuccess : function (responseType, data) {
                                                try {
                                                    for (var i = 0; i < data.length; i++) {
                                                        aTimezones.push(
                                                            new sap.ui.core.Item({
                                                                text : data[i].TIMEZONE_TZ,
                                                                key : data[i].TIMEZONE_PK
                                                            })
                                                        );
                                                    }
                                                } catch (e) {

                                                    jQuery.sap.log.error("Error gathering Timezones: "+JSON.stringify(e.message));

                                                } finally {
                                                    this.onProceed(displayData);
                                                }
                                            },

                                            onFail : function (response) {
                                                jQuery.sap.log.error("Error loading timezone OData: "+JSON.stringify(response));
                                                this.onProceed(displayData);
                                            },

                                            onProceed : function (displayData) {
                                                // Populate the combo boxes with the items that were
                                                // created using information from the OData.
                                                me.byId("addressCountry").destroyItems();
                                                for (var i = 0; i < aCountries.length; i++)
                                                    me.byId("addressCountry").addItem(aCountries[i]);

                                                me.byId("addressLanguage").destroyItems();
                                                for (var i = 0; i < aLanguages.length; i++)
                                                    me.byId("addressLanguage").addItem(aLanguages[i]);

                                                me.byId("addressState").destroyItems();
                                                for (var i = 0; i < aStates.length; i++)
                                                    me.byId("addressState").addItem(aStates[i]);

                                                me.byId("addressPostCode").destroyItems();
                                                for (var i = 0; i < aPostcodes.length; i++)
                                                    me.byId("addressPostCode").addItem(aPostcodes[i]);

                                                me.byId("addressTimezone").destroyItems();
                                                for (var i = 0; i < aTimezones.length; i++)
                                                    me.byId("addressTimezone").addItem(aTimezones[i]);
                                                
                                                if (displayData !== undefined) {
                                                    // Display the information retrieved from the Premise Location OData
                                                    // and set any foreign keys as item keys in the combo boxes.
                                                    me.byId("addressCountry").setSelectedKey(displayData.COUNTRIES_PK);
                                                    me.byId("addressLanguage").setSelectedKey(displayData.LANGUAGE_PK);
                                                    me.byId("addressState").setSelectedKey(displayData.STATEPROVINCE_PK);
                                                    me.byId("addressPostCode").setSelectedKey(displayData.POSTCODE_PK);
                                                    me.byId("addressTimezone").setSelectedKey(displayData.TIMEZONE_PK);
                                                    me.byId("UpdateLink").setEnabled(true);
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
    
});