/*
Title: IP Camera Page UI5 View
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Creates the page to view a camera feed, capture a screenshot or
    record some pictures, and any motion activity.
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

sap.ui.jsview("mjs.staging.Quadcopter", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.staging.Quadcopter
	****************************************************************************************************/ 
	getControllerName : function() {
		return "mjs.staging.Quadcopter";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.staging.Quadcopter
	****************************************************************************************************/ 
	createContent : function(oController) {
		var me = this;
		
        var oPage = new IOMy.widgets.IOMyPage({
            view : me,
            controller : oController,
            icon : "sap-icon://GoogleMaterial/lock",
            title : "Quadcopter"
        });
		
		return oPage;
	}

});