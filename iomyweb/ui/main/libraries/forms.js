/*
Title: iOmy Form Functions
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: Functions for the form objects.
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


$.sap.declare("iomy.forms",true);

iomy.forms = new sap.ui.base.Object();

$.extend( iomy.forms, {

	/* Toggles the "editable" form property allowing form objects to be outside of fragments */
	ToggleFormMode : function (oController, sFormId, bEditable) {
		var oView = oController.getView();	
		var bFormEdit = oView.byId(sFormId).getEditable();
		
		//console.log(bFormEdit);
		
		try {
			oView.byId(sFormId).setEditable(bEditable);	
		} catch(e1) {
			$.sap.log.error("ToggleFormMode: Critical Error"+e1.message);
			return false;
		}
	}

});