/*
Title: Link Type Select Box
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Creates a select box containing a list of link types.
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

$.sap.declare("IOMy.widgets.getLinkTypeSelector",true);

$.extend(IOMy.widgets,{
    
    /**
     * Returns a select box containing a list of link types accessible to the current user.
     * Can also accept a link type ID to immediately set that particular link type as the
     * current type for a link.
     * 
     * @param {string} sId          ID for the select box.
     * @returns {mixed}             Either the select box filled with link types or a text widget with an error message.
     */
    getLinkTypeSelector : function (sId, iLinkTypeId) {
        var oElement;
        
        try {
            //====================================================================\\
            // Clean up                                                           \\
            //====================================================================\\
            if (sap.ui.getCore().byId(sId) !== undefined)
                sap.ui.getCore().byId(sId).destroy();

            //====================================================================\\
            // Create the Select Box                                               \\
            //====================================================================\\
            var oCBox = new sap.m.Select(sId,{
                width : "100%"
            });

            for (var i = 0; i < IOMy.common.LinkTypeList.length; i++) {
                if (IOMy.common.LinkTypeList[i].LinkTypeId == 2 ||
                        IOMy.common.LinkTypeList[i].LinkTypeId == 6 ||
                        IOMy.common.LinkTypeList[i].LinkTypeId == 7 ||
                        IOMy.common.LinkTypeList[i].LinkTypeId == 8) 
                {
                    oCBox.addItem(
                        new sap.ui.core.Item({
                            text : IOMy.common.LinkTypeList[i].LinkTypeName,
                            key : IOMy.common.LinkTypeList[i].LinkTypeId
                        })
                    );
                }
            }

            if (iLinkTypeId !== undefined && iLinkTypeId !== null) {
                oCBox.setSelectedKey(iLinkTypeId);
            } else {
                oCBox.setSelectedKey(2);
            }

            oElement = oCBox;
            
        } catch (e) {
            jQuery.sap.log.error("Error in IOMy.widgets.getLinkTypeSelector(): "+e.message);
            IOMy.common.showError("Failed to load the link type select box\n\n"+e.message, "Error");
            oElement = new sap.m.Text(sId, {text : "Failed to load the link type select box."});
            
        } finally {
            
            return oElement; // Either a select box or an error message.
        }
    }
    
});