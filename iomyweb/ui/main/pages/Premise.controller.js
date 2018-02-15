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

sap.ui.controller("pages.Premise", {
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf pages.template.Template
*/

    onInit: function() {
        var oController = this;            //-- SCOPE: Allows subfunctions to access the current scope --//
        var oView = this.getView();
        
        oView.addEventDelegate({
            onBeforeShow : function (evt) {
                
                iomy.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
                oController.BuildPremiseListUI();
            }
        });
            
        
    },
    
    BuildPremiseListUI : function () {
        var oView               = this.getView();
        var wList               = oView.byId("PremiseList");
        
        // Wipe the old list.
        wList.destroyItems();
        
        // Fetch the list from the core variables.
        var aaPremiseList = iomy.common.PremiseList;
        
        try {
            //--------------------------------------------------------------------//
            // Construct the Premise List
            //--------------------------------------------------------------------//
            $.each(aaPremiseList, function (sJ, mPremise) {

                wList.addItem(
                    new sap.m.ObjectListItem (oView.createId("entry"+mPremise.Id), {        
                        title: mPremise.Name,
                        type: "Active",
                        number: iomy.functions.getNumberOfDevicesInPremise(mPremise.Id),
                        numberUnit: "Devices",
                        attributes : [
                            new sap.m.ObjectAttribute ({
                                text: "Address:"
                            }),
                            new sap.m.ObjectAttribute (oView.createId("PremiseAddress"+mPremise.Id), {
                                text: "Loading..."
                            })

                        ],
                        press : function () {
                            iomy.common.NavigationChangePage( "pDevice" , {PremiseId : mPremise.Id} , false);
                        }
                    })
                );

            });

            if (JSON.stringify(aaPremiseList) !== "{}") {
                this.LoadPremiseAddresses();
            }
            
        } catch (e) {
            $.sap.log.error("Error loading premise list ("+e.name+"): " + e.message);
        }
    },
    
    LoadPremiseAddresses : function () {
        var oController = this;
        
        try {
            iomy.apiodata.AjaxRequest({
                Url : iomy.apiodata.ODataLocation("premiselocation"),
                Columns : ["PREMISE_PK", "REGION_NAME", "REGION_PK", "LANGUAGE_PK", "LANGUAGE_NAME", 
                            "PREMISEADDRESS_POSTCODE", "PREMISEADDRESS_SUBREGION",
                            "TIMEZONE_PK", "TIMEZONE_TZ", "PREMISEADDRESS_LINE1", "PREMISEADDRESS_LINE2",
                            "PREMISEADDRESS_LINE3", "PREMISEADDRESS_PK"],
                WhereClause : [],
                OrderByClause : [],

                onSuccess : function (responseType, data) {
                    var oView       = oController.getView();
                    var iEntries    = data.length;
                    var sAddress    = "";
                    var mEntry;

                    for (var i = 0; i < iEntries; i++) {
                        try {
                            mEntry = data[i];

                            //--------------------------------------------------------//
                            // Construct the Address Display String.
                            //--------------------------------------------------------//
                            if (mEntry.PREMISEADDRESS_LINE1 !== null && mEntry.PREMISEADDRESS_LINE1 !== "") {
                                sAddress += mEntry.PREMISEADDRESS_LINE1;
                            }

                            if (mEntry.PREMISEADDRESS_LINE2 !== null && mEntry.PREMISEADDRESS_LINE2 !== "") {
                                if (sAddress.length > 0) {
                                    sAddress += ", ";
                                }

                                sAddress += mEntry.PREMISEADDRESS_LINE2;
                            }

                            if (mEntry.PREMISEADDRESS_LINE3 !== null && mEntry.PREMISEADDRESS_LINE3 !== "") {
                                if (sAddress.length > 0) {
                                    sAddress += ", ";
                                }

                                sAddress += mEntry.PREMISEADDRESS_LINE3;
                            }

                            if (mEntry.PREMISEADDRESS_SUBREGION !== null && mEntry.PREMISEADDRESS_SUBREGION !== "") {
                                if (sAddress.length > 0) {
                                    sAddress += ", ";
                                }

                                sAddress += mEntry.PREMISEADDRESS_SUBREGION;
                            }

                            if (mEntry.PREMISEADDRESS_POSTCODE !== null && mEntry.PREMISEADDRESS_POSTCODE !== "") {
                                if (sAddress.length > 0) {
                                    sAddress += " ";
                                }

                                sAddress += mEntry.PREMISEADDRESS_POSTCODE;
                            }

                            //--------------------------------------------------------//
                            // Display the address
                            //--------------------------------------------------------//
                            oView.byId("PremiseAddress"+mEntry.PREMISE_PK).setText(sAddress);

                            sAddress = "";
                        } catch (e) {
                            $.sap.log.error("Error processing the address ("+e.name+"): " + e.message);
                        }
                    }
                },

                onFail : function (response) {
                    iomy.common.showError("There was an unexpected error loading the premise address.");
                    jQuery.sap.log.error(JSON.stringify(response));
                }
            });
            
        } catch (e) {
            $.sap.log.error("Error attempting to load premise addresses ("+e.name+"): " + e.message);
            
        }
    }
    
});