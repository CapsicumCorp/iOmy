/*
Title: Hub Select Box
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Returns a select box containing a list of hubs accessible to the current user.
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

$.sap.declare("IomyRe.widgets.selectBoxHub",true);

$.extend(IomyRe.widgets,{
    
    /**
     * Returns a select box containing a list of hubs accessible to the current user.
     * Can also accept a hub ID to immediately set that particular hub as currently
     * selected.
     * 
     * @param {string} sId          ID for the select box.
     * @param {Number} iPremiseId   ID of the given hub.
     * @returns {mixed}             Either the select box filled with hubs or a text widget with an error message.
     */
    selectBoxHub : function (sId, iHubId) {
        var oElement;
        
        try {
            //====================================================================//
            // Clean up                                                           //
            //====================================================================//
            if (sap.ui.getCore().byId(sId) !== undefined)
                sap.ui.getCore().byId(sId).destroy();

            //====================================================================//
            // Create the Combo Box                                               //
            //====================================================================//
            var oSBox = new sap.m.Select(sId,{
                width : "100%"
            });

            $.each(IomyRe.common.HubList, function (sI, mHub) {
				oSBox.addItem(
                    new sap.ui.core.Item({
                        text : mHub.HubName,
                        key : mHub.HubId
                    })
                );
			});

            if (iHubId !== undefined && iHubId !== null) {
                oSBox.setSelectedKey(iHubId);
            } else {
                oSBox.setSelectedKey(null);
            }

            oElement = oSBox;
            
        } catch (e) {
            jQuery.sap.log.error("Error in IomyRe.widgets.getHubSelector(): "+e.message);
            IomyRe.common.showError("Failed to load the hub combo box\n\n"+e.message, "Error");
            oElement = new sap.m.Text(sId, {text : "Failed to load the hub combo box."});
            
        } finally {
            
            return oElement; // Either a combo box or an error message.
        }
    }
    
});