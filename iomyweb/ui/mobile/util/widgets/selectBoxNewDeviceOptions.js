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

$.sap.declare("IOMy.widgets.selectBoxNewDeviceOptions",true);

$.extend(IOMy.widgets,{
    
    /**
     * Returns a select box containing a list of device types and onvif servers
     * 
     * @param {string} sId          ID for the select box.
     * @returns {sap.m.Select}      Select box with the options.
     */
    selectBoxNewDeviceOptions : function (sId) {
        //================================================================//
		// Declare Variables
		//================================================================//
		var aaOptions = IOMy.functions.getNewDeviceOptions();
		var oSBox;

		//================================================================//
		// Create the Select Box
		//================================================================//
		oSBox = new sap.m.Select(sId,{
			width : "100%"
		});

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
		
		oSBox.setSelectedKey(null);

		return oSBox;
    }
    
});