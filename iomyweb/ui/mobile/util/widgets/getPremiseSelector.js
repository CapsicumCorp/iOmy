/*
Title: Premise Select Box
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Creates a select box with a list of premises
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

$.sap.declare("IOMy.widgets.getPremiseSelector",true);

$.extend(IOMy.widgets,{
    
    /**
     * Returns a select box containing a list of premises accessible to the current user.
     * Can also accept a premise ID to immediately set that particular premise as the
     * current premise for a hub, for instance.
     * 
     * @param {string} sId          ID for the select box.
     * @param {Number} iPremiseId   ID of the given premise.
     * @returns {sap.m.ComboBox}
     */
    getPremiseSelector : function (sId, iPremiseId) {
        try {
            //====================================================================\\
            // Create the Select Box                                               \\
            //====================================================================\\
            if (IOMy.common.PremiseList.length !== 0) {
                var oSBox = new sap.m.Select(sId,{
                    width : "100%"
                });
                
                for (var i = 0; i < IOMy.common.PremiseList.length; i++) {
                    oSBox.addItem(
                        new sap.ui.core.Item({
                            text : IOMy.common.PremiseList[i].Name,
                            key : IOMy.common.PremiseList[i].Id
                        })
                    );
                }

                if (iPremiseId !== undefined && iPremiseId !== null) {
                    oSBox.setSelectedKey(iPremiseId);
                } else {
                    oSBox.setSelectedKey(null);
                }

                return oSBox;
            } else {
                // Something has gone awfully wrong for this to execute!
                return new sap.m.Text(sId, {text : "You have no premises."});
            }
        } catch (e) {
            jQuery.sap.log.error("Error in IOMy.widgets.getPremiseSelector(): "+e.message);
            IOMy.common.showError("Failed to load the premise select box\n\n"+e.message, "Error");
            return new sap.m.Text(sId, {text : "Failed to load the premise select box."});
        }
    }
    
});