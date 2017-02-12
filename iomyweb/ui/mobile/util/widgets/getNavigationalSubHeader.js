/*
Title: Page Sub-Header with Page Navigation Button
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Constructs the sub header for a given page. Contains the page
    title, and spaces for the back and forward buttons.
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

$.sap.declare("IOMy.widgets.getNavigationalSubHeader",true);

$.extend(IOMy.widgets,{
    
    //========================================================================================================//
	//== IOMY NAVIGATIONAL SUB HEADER																		==//
	//========================================================================================================//
	//-- This is used to draw the Navigational Header (which is normally located below the Page Header).	--//
	//-- It will display the Page Title, Icon (if applicable) as well as the "Back" and "Forward" buttons	--//
	//--------------------------------------------------------------------------------------------------------//
    
    /**
     * Constructs the sub header that will situate just below the header. It will
     * have a title with an icon to the left of the title. There will also be back
     * and forward navigation buttons that will respectively appear if you can
     * navigate back or forward.
     * 
     * @param {string} sTitle       Page title to display
     * @param {string} sPageIcon    Icon to display to the left of the title
     * @param {mixed} oScope        UI5 Controller or View that will have the subheader.
     * @returns {sap.m.Bar}
     */
	getNavigationalSubHeader : function (sTitle, sPageIcon, oScope) {
		//--------------------------------------------//
		//-- 1.0 - Initialise						--//
		//--------------------------------------------//
		var me				= this;				//-- SCOPE:		Bind the current scope to a variable for other subfunctions,etc --//
		var oHeader;							//-- OBJECT:	This variable stores the Page header and is returned. --//
		var oTitleText;							//-- OBJECT:	This will hold the Title --//
		var oPageIcon;							//-- OBJECT:	This will hold the forward button that the user can click to go back a page --//
		var oBackBtn;							//-- OBJECT:	This will hold the back button that the user can click to go back a page --//
		var oForwardBtn;						//-- OBJECT:	This will hold the forward button that the user can click to go back a page --//
		
		//--------------------------------------------//
		//-- 2.0 - Create the objects				--//
		//--------------------------------------------//
		if( typeof oScope==="undefined" || oScope===false || oScope===null ) {
			
			//-- 2.1.1 - Left Content Back Button --//
			oBackBtn = new sap.m.Button({
				icon:	"sap-icon://navigation-left-arrow",
				type: sap.m.ButtonType.Unstyled,
				//-- Bind the Back Navigation Event --//
				press: function (oControlEvent) {
					IOMy.common.NavigationTriggerBackForward( false );
				}
			}).addStyleClass("BackForwardButton PadTop5px Text_grey_11 TextSize38px");
			
			//-- 2.1.2 - Page Icon (if applicable) --//
			if( sPageIcon!==undefined && sPageIcon!=="" ) {
				oPageIcon = new sap.ui.core.Icon({
					src : sPageIcon,
					//densityAware : false
				}).addStyleClass("TextSize2Rem NavHeader-Icon");
			} else {
				oPageIcon = new sap.m.Text({ text:"" });
			}
			
			
			//-- 2.1.3 - Center Content Title --//
			oTitleText = new sap.m.Text( oScope.createId( "NavSubHead_BackBtn" ), {
				text : sTitle,
				wrapping : false
			}).addStyleClass("TextSize1d25Rem Text_black");
			
			
			//-- 2.1.4 - Right Content Forward button (if Applicable) --//
			oForwardBtn = new sap.m.Button({
				icon:	"sap-icon://navigation-right-arrow",
				type: sap.m.ButtonType.Unstyled,
				//-- Bind the Back Navigation Event --//
				press: function (oControlEvent) {
					IOMy.common.NavigationTriggerBackForward( true );
                    this.rerender();
				}
			}).addStyleClass("BackForwardButton PadTop5px Text_grey_11 TextSize38px");
			
		} else {
			
			//-- 2.2.1 - Left Content Back Button --//
			oBackBtn = new sap.m.Button( oScope.createId( "NavSubHead_BackBtn" ), {
				visible: false,
				icon:	"sap-icon://navigation-left-arrow",
				type: sap.m.ButtonType.Unstyled,
				//-- Bind the Back Navigation Event --//
				press: function (oControlEvent) {
					IOMy.common.NavigationTriggerBackForward( false );
				}
			}).addStyleClass("BackForwardButton Text_grey_11 PadTop5px TextSize38px");
			
			//-- 2.2.2 - Page Icon (if applicable) --//
			if( sPageIcon!==undefined && sPageIcon!=="" ) {
                oPageIcon = new sap.ui.core.Icon({
                    src : sPageIcon
                }).addStyleClass("TextSize2Rem NavHeader-Icon");
			} else {
				oPageIcon = new sap.m.Text({ text:"" });
			}
			
			
			//-- 2.2.3 - Center Content Title --//
			oTitleText = new sap.m.Text( oScope.createId( "NavSubHead_Title" ), {
				text : sTitle,
				wrapping : false
			}).addStyleClass("TextSize1d25Rem Text_black NavHeader-Text");
			
			
			//-- 2.2.4 - Right Content Forward button (if Applicable) --//
			oForwardBtn = new sap.m.Button( oScope.createId( "NavSubHead_ForwardBtn" ), {
				visible: false,
				icon:	"sap-icon://navigation-right-arrow",
				type: sap.m.ButtonType.Unstyled,
				//-- Bind the Back Navigation Event --//
				press: function (oControlEvent) {
					IOMy.common.NavigationTriggerBackForward( true );
				}
			}).addStyleClass("BackForwardButton Text_grey_11 PadTop5px TextSize38px");
			
		}
		
		//--------------------------------------------//
		//-- 3.0 - Create the SubHeader itself		--//
		//--------------------------------------------//
		oHeader = new sap.m.Bar({
			contentLeft:[
                oBackBtn
            ],
			contentMiddle:[
                new sap.m.HBox({
                    items: [
                        oPageIcon,
                        oTitleText
                    ]
                })
            ],
			contentRight:[
                oForwardBtn
            ],
			design : sap.m.BarDesign.SubHeader
		}).addStyleClass("HeaderLower BG_white MaxWidth");
		
		//--------------------------------------------//
		//-- 4.0 - Return the Results				--//
		//--------------------------------------------//
		return oHeader;
	}
    
});