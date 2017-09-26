/*
Title: Thing Select Box
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Creates a select box containing a list of things.
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

$.sap.declare("IomyRe.widgets.selectBoxNewDeviceOptions",true);

$.sap.require("IomyRe.functions.getNewDeviceOptions");

$.extend(IomyRe.widgets,{
    
    /**
     * Returns a select box containing a list of device types and onvif servers
     * 
     * @param {string} sId          ID for the select box.
     * @param {object} mSettings    Map containing parameters.
     * 
     * @returns {sap.m.Select}      Select box with the options.
     * 
     * @throws IllegalArgumentException if either the ID or the settings map is of an incorrect type.
     */
    selectBoxNewDeviceOptions : function (sId, mSettings) {
        //================================================================//
		// Declare Variables
		//================================================================//
		try {
            var aaOptions = IomyRe.functions.getNewDeviceOptions();
            var oSBox;
            var sID;
        } catch (e) {
            jQuery.sap.log.error(e.name+": "+e.message);
        }

        
		//================================================================//
        // Process any settings and create the select box
		//================================================================//
        if (typeof sId === "string") {
            sID = sId;
            
            if (typeof mSettings === "object") {

                if (mSettings === undefined) {
                    mSettings = {};
                }

                mSettings.items = [
                    new sap.ui.core.Item ({
                        text: "Please choose a device type",
                        key: "start"
                    })
                ];

                oSBox = new sap.m.Select(sId, mSettings);
                
            } else {
                throw new IllegalArgumentException("'mSettings' is not an object. Type given: '"+typeof mSettings+"'.");
            }
            
        } else if (typeof sId === "object") {
            //----------------------------------------------------------------//
            // The first parameter must in fact be the settings map.
            //----------------------------------------------------------------//
            mSettings = sId;
            
            oSBox = new sap.m.Select(mSettings);
            
        } else {
            throw new IllegalArgumentException("Element ID is not a valid type. Must be a string. Type given: '"+typeof sId+"'.");
        }
		

		$.each(aaOptions, function(sIndex,mEntry) {
			if( sIndex!==undefined && sIndex!==null && mEntry!==undefined && mEntry!==null ) {
				oSBox.addItem(
					new sap.ui.core.Item({
						text : mEntry.Name,
						key : sIndex
					})
				);
			}
		});
		
		//oSBox.setSelectedKey(null);

		return oSBox;
    }
    
});