/*
Title: iOmy Help Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Declares the help module with a variable containing the text that
    should be displayed when the help button is pressed on any page in the app.
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

$.sap.declare("IOMy.help",true);

IOMy.help = new sap.ui.base.Object();

$.extend(IOMy.help,{
    
    /**
     * Map containing help information pertaining to each page. Information is
     * accessible using the ID of the page currently being viewed (example,
     * IOMy.help.PageInformation["pLogin"] = "This page logs you in.").
     * 
     * Initially declared as an empty object and populated in app.js as each UI5
     * activity is created.
     */
    PageInformation : {}
    
});