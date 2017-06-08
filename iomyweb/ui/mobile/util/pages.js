/*
Title: Page Handling Library
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Provides a couple of functions for loading pages if they haven't
	already been loaded.
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
along with iOmy. If not, see <http://www.gnu.org/licenses/>.

*/

$.sap.declare("IOMy.pages",true);
IOMy.pages = new sap.ui.base.Object();

$.extend(IOMy.pages,{
	
	/**
	 * Retrieves the page data for a given page denoted by its ID.
	 * 
	 * @param {string} sID			Page ID used to fetch the corresponding data
	 * @returns {map}				JS object containing page data
	 * 
	 * @throws MissingArgumentException if page ID is not given
	 * @throws iOmyException if the page data doesn't exist for the given page.
	 */
	getPageData : function (sID) {
		var mPageData = null;
		
		if (sID === undefined) {
			throw new MissingArgumentException("Page ID must be given!");
		}
		
		//--------------------------------------------------------------------//
		// aPages is declared in app.js. Go through this array to find the data
		// for a proposed page.
		//--------------------------------------------------------------------//
		for (var i = 0; aPages.length; i++) {
			if (aPages[i].Id === sID) {
				mPageData = aPages[i];
				break;
			}
		}
		
		if (mPageData === null) {
			throw new iOmyException("Data could not be found for page '"+sID+"'.")
		}
		
		return mPageData;
	},
	
	/**
	 * This procedure creates a page if it does not exist already.
	 * 
	 * @param {type} sID
	 */
	createPage : function (sID) {
		var sErMesg = "";
		
		//--------------------------------------------------------------------//
		// Create the page if it does not yet exist
		//--------------------------------------------------------------------//
		if (oApp.getPage(sID) === null) {
			try {
				//--------------------------------//
				// Declare variables
				//--------------------------------//
				var aPageData		= this.getPageData(sID);
				var sType;
				sErMesg				= aPageData.ErrMesg;
				
				switch(aPageData.Type) {
					case "JS":
						sType =		sap.ui.core.mvc.ViewType.JS;
						break;

					case "XML":
						sType =		sap.ui.core.mvc.ViewType.XML;
						break;

				}

				//------------------------------------//
				// Add the page
				//------------------------------------//
				oApp.addPage(
					new sap.ui.view({
						id:			aPageData.Id,
						viewName:	aPageData.Location,
						type:		sType
					})
				);
			
				//------------------------------------------------------------//
				// If there's a help message for this page, enable the help
				// button.
				//------------------------------------------------------------//
				if (IOMy.help.PageInformation[sID] !== undefined) {
					oApp.getPage(sID).byId("helpButton").setEnabled(true);
				}

			} catch (ex) {
				jQuery.sap.log.error( sErMesg + ex.message );
			}
		} else {
			jQuery.sap.log.warning( "Page '"+sID+"' already exists!" );
		}
	}
	
});