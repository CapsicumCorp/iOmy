/*
Title: iOmy Page Header
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Header with the app navigation button, iOmy logo, and space for
    the action menu if one is created for a page.
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

$.sap.declare("IOMy.widgets.getIOMYPageHeaderNav",true);

$.extend(IOMy.widgets,{
    
    /**
     * Constructs the header bar for IOMy located one every page but the "Login" or
     * "Switch User" Pages. Contains the menu button on the left to
     * bring up the IOMy app menu. In the middle is the IOMy logo, and on the right
     * is a placeholder for a button that brings up a menu with extra options pertaining
     * to the current page. This button appears only on certain pages.
     * 
     * @param {object} oCurrentController    UI5 Controller or View that the app header appears on
     * @returns {sap.m.Bar}                 App Header
     */
	getIOMYPageHeaderNav : function ( oCurrentController ) {
		//----------------------------------------------------//
		//-- 1.0 - Initialise                               --//
		//----------------------------------------------------//
		var me				= this;				//-- SCOPE:		Bind the current scope to a variable for other subfunctions,etc --//
		var oHeader;							//-- OBJECT:	This variable stores the Page header and is returned. --//
		var oLogoImg;							//-- OBJECT:	Stores the UI5 Object that is used to hold the scaled down version of the icon --//
		var oNavOpenBtn;						//-- OBJECT:	Stores the UI5 Button that holds the Navigation Open Button				--//
		
		//----------------------------------------------------//
		//-- 2.0 - Left Content                             --//
		//----------------------------------------------------//
		oNavOpenBtn = new sap.m.Button({
			icon:	"sap-icon://GoogleMaterial/menu",
			type:	sap.m.ButtonType.Unstyled,
			press:	function(oControlEvent) {
				//oCurrentController.onOpenNavMenu( oControlEvent );
				if(!oCurrentController.oNavMenu) {
					oCurrentController.oNavMenu = sap.ui.jsfragment("mjs.fragments.NavMenu", oCurrentController );
					oCurrentController.getView().addDependent( oCurrentController.oNavMenu );
					
				}
				
				var oButton = oControlEvent.getSource();
				//-- Wait for UI5 to do the redraw after adding the Fragment so that the fragment is loaded before it is opened --//
				$.sap.delayedCall(0, oCurrentController, function() {
					if (oCurrentController.oNavMenu.isOpen())
                        oCurrentController.oNavMenu.close();
                    else
                        oCurrentController.oNavMenu.openBy( oButton );
				});
			}
		}).addStyleClass("NavButton");
        
        //----------------------------------------------------//
		//-- 3.0 - Right Content Create Logo                --//
		//----------------------------------------------------//
		oLogoImg = new sap.m.Image({
			densityAware: false,
			src : "resources/images/minilogo.png",
			press: function(oControlEvent) {
				IOMy.common.NavigationReturnToHome();
			}
		}).addStyleClass("BG_white PadAll2px MarTop6px MainHeadingMiniLogo");
		
		//----------------------------------------------------//
		//-- 4.0 - Create the Page Header Section itself    --//
		//----------------------------------------------------//
		oHeader = new sap.m.Bar({
			design:	"Header",
			contentLeft:[oNavOpenBtn],
            contentMiddle:[oLogoImg],
			contentRight:[
				new sap.m.HBox({
                    items : [
                        new sap.m.VBox(oCurrentController.getView().createId("extrasMenuHolder"), {})
                    ]
                })
			]
		});
		
		//----------------------------------------------------//
		//-- 5.0 - Return the Results                       --//
		//----------------------------------------------------//
		return oHeader;
	}
    
});