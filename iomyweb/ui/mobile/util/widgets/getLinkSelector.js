/*
Title: Link Select Box
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Creates a select box containing a list of links.
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

$.sap.declare("IOMy.widgets.getLinkSelector",true);

$.extend(IOMy.widgets,{
    
    /**
     * Returns a combo box containing a list of links accessible to the current user.
     * Can also accept a link ID to immediately set that particular link type as the
     * current type for a link.
     * 
     * @param {string} sId          ID for the combo box.
     * @returns {mixed}             Either the combo box filled with links or a text widget with an error message.
     */
    getLinkSelector : function (sId, iLinkId) {
        var oElement;
        
        try {
            //====================================================================\\
            // Clean up                                                           \\
            //====================================================================\\
            if (sap.ui.getCore().byId(sId) !== undefined)
                sap.ui.getCore().byId(sId).destroy();

            //====================================================================\\
            // Create the Combo Box                                               \\
            //====================================================================\\
            var oCBox = new sap.m.Select(sId,{
                width : "100%"
            });

            for (var i = 0; i < IOMy.common.LinkList.length; i++) {
                oCBox.addItem(
                    new sap.ui.core.Item({
                        text : IOMy.common.LinkList[i].LinkName,
                        key : IOMy.common.LinkList[i].LinkId
                    })
                );
            }

            if (iLinkId !== undefined && iLinkId !== null) {
                oCBox.setSelectedKey(iLinkId);
            } else {
                oCBox.setSelectedKey(null);
            }

            oElement = oCBox;
            
        } catch (e) {
            jQuery.sap.log.error("Error in IOMy.widgets.getLinkSelector(): "+e.message);
            IOMy.common.showError("Failed to load the link combo box\n\n"+e.message, "Error");
            oElement = new sap.m.Text(sId, {text : "Failed to load the link combo box."});
            
        } finally {
            
            return oElement; // Either a combo box or an error message.
        }
    }
    
});